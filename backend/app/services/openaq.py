from __future__ import annotations

import json
import random
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

import httpx

from ..config import get_openaq_api_key
from ..schemas import AQIInsight, City, Coordinates, PollutantReading, TrendPoint
from ..utils.aqi import advice_for_category, calculate_aqi, category_for_aqi, pollutant_name

DATA_DIR = Path(__file__).resolve().parents[1] / 'data'
CITIES_PATH = DATA_DIR / 'cities.json'
FALLBACK_PATH = DATA_DIR / 'fallback_data.json'
OPENAQ_LATEST_ENDPOINT = 'https://api.openaq.org/v3/latest'
OPENAQ_LOCATIONS_ENDPOINT = 'https://api.openaq.org/v3/locations'
def _build_headers() -> dict[str, str]:
    headers: dict[str, str] = {
        'Accept': 'application/json',
        'User-Agent': 'AQITracker/1.0 (+https://github.com/your-org/AQITracker)',
    }

    api_key = get_openaq_api_key()
    if api_key:
        headers['X-API-Key'] = api_key

    return headers

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


def _load_fallback(city: str, reason: Optional[str] = None) -> AQIInsight:
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

    default_message = 'Live air quality data is temporarily unavailable for this location. Please try again later.'
    message = reason or (fallback.get('message') if fallback and fallback.get('message') else default_message)

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

    headers = _build_headers()
    if 'X-API-Key' not in headers:
        return _load_fallback(
            city,
            reason=(
                'Live OpenAQ data requires an API key. Set the OPENAQ_API_KEY environment variable '
                'for the backend service to fetch current readings.'
            ),
        )

    async with httpx.AsyncClient(timeout=6.0, headers=headers) as client:
        location_ids: List[int | str] = []

        # Prefer explicit locations so we can query the latest endpoint with stable identifiers.
        location_queries = []
        if city_meta:
            location_queries.append(
                {
                    'coordinates': f"{city_meta.latitude},{city_meta.longitude}",
                    'radius': 50000,
                    'limit': 5,
                    'order_by': 'distance',
                    'sort': 'asc',
                }
            )

        location_queries.append({'city': city, 'limit': 5})

        seen_locations = set()
        for params in location_queries:
            try:
                response = await client.get(OPENAQ_LOCATIONS_ENDPOINT, params=params)
                response.raise_for_status()
                payload = response.json()
            except (httpx.HTTPError, ValueError):
                continue

            results = payload.get('results') or payload.get('data') or []
            for entry in results:
                location_id = (
                    entry.get('id')
                    or entry.get('locationId')
                    or entry.get('location_id')
                )
                if location_id is None or location_id in seen_locations:
                    continue
                seen_locations.add(location_id)
                location_ids.append(location_id)

        # Fall back to a city-level query if no specific locations were returned.
        if not location_ids:
            location_ids.append(city)

        for identifier in location_ids:
            params: Dict[str, str] = {'limit': 1}
            if isinstance(identifier, int):
                params['location_id'] = str(identifier)
            else:
                params['city'] = identifier

            try:
                response = await client.get(OPENAQ_LATEST_ENDPOINT, params=params)
                response.raise_for_status()
                payload = response.json()
            except (httpx.HTTPError, ValueError):
                continue

            parsed = _parse_openaq_response(payload)
            if parsed:
                return parsed

    return _load_fallback(city)
