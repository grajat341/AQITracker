from __future__ import annotations

import json
import os
import random
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

import httpx

from ..schemas import AQIInsight, City, Coordinates, PollutantReading, TrendPoint
from ..utils.aqi import advice_for_category, calculate_aqi, category_for_aqi, pollutant_name

DATA_DIR = Path(__file__).resolve().parents[1] / 'data'
CITIES_PATH = DATA_DIR / 'cities.json'
FALLBACK_PATH = DATA_DIR / 'fallback_data.json'
OPENAQ_ENDPOINT = 'https://api.openaq.org/v3/latest'
OPENAQ_HEADERS = {
    'Accept': 'application/json',
    'User-Agent': 'AQITracker/1.0 (+https://github.com/your-org/AQITracker)',
}

API_KEY = os.getenv('OPENAQ_API_KEY')
if API_KEY:
    OPENAQ_HEADERS['X-API-Key'] = API_KEY

with CITIES_PATH.open('r', encoding='utf-8') as file:
    CITY_CACHE: List[City] = [City(**city) for city in json.load(file)]

with FALLBACK_PATH.open('r', encoding='utf-8') as file:
    FALLBACK_DATA: Dict[str, Dict] = json.load(file)

MOLECULAR_MASSES = {
    'o3': 48.0,
    'no2': 46.0,
    'so2': 64.1,
    'co': 28.0,
}


def list_cities() -> List[City]:
    return CITY_CACHE


def _load_fallback(city: str) -> AQIInsight:
    normalized = city.lower()
    fallback = next((data for name, data in FALLBACK_DATA.items() if name.lower() == normalized), None)
    city_meta = next((entry for entry in CITY_CACHE if entry.city.lower() == normalized), None)

    timestamp = datetime.utcnow()
    if fallback and fallback.get('timestamp'):
        try:
            timestamp = datetime.fromisoformat(fallback['timestamp'].replace('Z', '+00:00'))
        except ValueError:
            pass

    coordinates_data = fallback.get('coordinates') if fallback else None
    if not coordinates_data and city_meta:
        coordinates_data = {
            'latitude': city_meta.latitude,
            'longitude': city_meta.longitude,
        }

    message = (
        fallback.get('message')
        if fallback and fallback.get('message')
        else 'Live air quality data is temporarily unavailable for this location. Please try again later.'
    )

    city_name = (
        fallback.get('city')
        if fallback and fallback.get('city')
        else (city_meta.city if city_meta else city)
    )

    country = (
        fallback.get('country')
        if fallback and fallback.get('country')
        else (city_meta.country if city_meta else 'Unknown')
    )

    return AQIInsight(
        city=city_name,
        country=country,
        aqi=None,
        dominantPollutant=None,
        category='Unavailable',
        advice=message,
        timestamp=timestamp,
        coordinates=Coordinates(**coordinates_data) if coordinates_data else None,
        pollutants=[],
        trend=[],
        source='fallback',
    )


def _convert_unit(code: str, value: float, unit: str) -> float:
    if unit.lower() in {'ppm', 'ppb'}:
        if unit.lower() == 'ppb':
            return value / 1000
        return value

    if unit == 'µg/m³' and code in MOLECULAR_MASSES:
        # ppm = (µg/m³ * 24.45) / (molecular_weight * 1000)
        return (value * 24.45) / (MOLECULAR_MASSES[code] * 1000)

    return value


def _build_trend(current_aqi: int) -> List[TrendPoint]:
    now = datetime.utcnow()
    points: List[TrendPoint] = []
    for hour in range(24):
        target_time = now - timedelta(hours=23 - hour)
        random_offset = random.gauss(0, 8)
        value = max(0, min(400, int(current_aqi + random_offset)))
        points.append(TrendPoint(time=target_time.strftime('%H:%M'), aqi=value))
    return points


def _parse_openaq_response(payload: dict) -> Optional[AQIInsight]:
    results = payload.get('results') or payload.get('data') or []
    if not results:
        return None

    entry = results[0]
    city = entry.get('city') or entry.get('location')
    country = entry.get('country')
    coordinates_data = entry.get('coordinates')
    measurements = entry.get('measurements') or entry.get('parameters') or []
    if not city or not measurements:
        return None

    pollutants: List[PollutantReading] = []
    max_aqi: Optional[int] = None
    dominant = ''
    latest_timestamp = datetime.utcnow()

    for measurement in measurements:
        code = measurement.get('parameter')
        if not code:
            continue
        code = code.lower()
        raw_value = float(measurement.get('value', 0))
        unit = measurement.get('unit', '')
        normalized_value = _convert_unit(code, raw_value, unit)
        aqi_value = calculate_aqi(code, normalized_value)

        last_updated = (
            measurement.get('lastUpdated')
            or measurement.get('last_updated')
            or measurement.get('datetime')
        )
        if last_updated:
            try:
                latest_timestamp = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
            except ValueError:
                pass

        pollutants.append(
            PollutantReading(
                code=code,
                name=pollutant_name(code),
                value=raw_value,
                unit=unit,
                aqi=aqi_value,
            )
        )

        if max_aqi is None or aqi_value >= max_aqi:
            max_aqi = aqi_value
            dominant = code

    if not pollutants:
        return None

    overall_aqi = max_aqi if max_aqi is not None else 0

    category = category_for_aqi(overall_aqi)
    advice = advice_for_category(category)

    return AQIInsight(
        city=city,
        country=country or 'Unknown',
        aqi=overall_aqi,
        dominantPollutant=dominant or (pollutants[0].code if pollutants else 'pm25'),
        category=category,
        advice=advice,
        timestamp=latest_timestamp,
        coordinates=Coordinates(**coordinates_data) if coordinates_data else None,
        pollutants=pollutants,
        trend=_build_trend(overall_aqi),
        source='live',
    )


async def get_aqi_for_city(city: str) -> AQIInsight:
    normalized = city.lower()
    city_meta = next((entry for entry in CITY_CACHE if entry.city.lower() == normalized), None)

    queries = [
        {
            'city': city,
            'limit': 1,
            'sort': 'desc',
        }
    ]

    if city_meta:
        queries.append(
            {
                'coordinates': f"{city_meta.latitude},{city_meta.longitude}",
                'radius': 50000,
                'limit': 1,
                'sort': 'desc',
            }
        )

    async with httpx.AsyncClient(timeout=6.0, headers=OPENAQ_HEADERS) as client:
        for params in queries:
            try:
                response = await client.get(OPENAQ_ENDPOINT, params=params)
                response.raise_for_status()
                payload = response.json()
            except (httpx.HTTPError, ValueError):
                continue

            parsed = _parse_openaq_response(payload)
            if parsed:
                return parsed

    return _load_fallback(city)
