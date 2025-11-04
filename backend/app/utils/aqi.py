from __future__ import annotations

from typing import Dict, Tuple

PollutantBreakpoints = Dict[str, Tuple[Tuple[float, float, int, int], ...]]

BREAKPOINTS: PollutantBreakpoints = {
    'pm25': (
        (0.0, 12.0, 0, 50),
        (12.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 500.4, 301, 500),
    ),
    'pm10': (
        (0.0, 54.0, 0, 50),
        (54.1, 154.0, 51, 100),
        (154.1, 254.0, 101, 150),
        (254.1, 354.0, 151, 200),
        (354.1, 424.0, 201, 300),
        (424.1, 604.0, 301, 500),
    ),
    'o3': (
        (0.0, 0.054, 0, 50),
        (0.055, 0.070, 51, 100),
        (0.071, 0.085, 101, 150),
        (0.086, 0.105, 151, 200),
        (0.106, 0.200, 201, 300),
    ),
    'no2': (
        (0.0, 0.053, 0, 50),
        (0.054, 0.100, 51, 100),
        (0.101, 0.360, 101, 150),
        (0.361, 0.649, 151, 200),
        (0.650, 1.249, 201, 300),
    ),
    'so2': (
        (0.0, 0.035, 0, 50),
        (0.036, 0.075, 51, 100),
        (0.076, 0.185, 101, 150),
        (0.186, 0.304, 151, 200),
        (0.305, 0.604, 201, 300),
    ),
    'co': (
        (0.0, 4.4, 0, 50),
        (4.5, 9.4, 51, 100),
        (9.5, 12.4, 101, 150),
        (12.5, 15.4, 151, 200),
        (15.5, 30.4, 201, 300),
    ),
}

POLLUTANT_LABELS = {
    'pm25': 'PM2.5',
    'pm10': 'PM10',
    'o3': 'Ozone',
    'no2': 'Nitrogen Dioxide',
    'so2': 'Sulfur Dioxide',
    'co': 'Carbon Monoxide',
}


def calculate_aqi(pollutant: str, value: float) -> int:
    pollutant = pollutant.lower()
    breakpoints = BREAKPOINTS.get(pollutant)
    if not breakpoints:
        return int(value)

    for c_low, c_high, i_low, i_high in breakpoints:
        if c_low <= value <= c_high:
            aqi = (i_high - i_low) / (c_high - c_low) * (value - c_low) + i_low
            return round(aqi)

    return int(min(max(value, 0), 500))


def category_for_aqi(aqi: int) -> str:
    if aqi <= 50:
        return 'Good'
    if aqi <= 100:
        return 'Moderate'
    if aqi <= 150:
        return 'Unhealthy'
    if aqi <= 200:
        return 'Very Unhealthy'
    return 'Hazardous'


def advice_for_category(category: str) -> str:
    mapping = {
        'Good': 'Air quality is ideal for outdoor activities.',
        'Moderate': 'Sensitive individuals should consider limiting prolonged outdoor exertion.',
        'Unhealthy': 'People with respiratory issues should avoid outdoor exertion; consider wearing protective masks.',
        'Very Unhealthy': 'Everyone should limit outdoor exposure and use air purifiers indoors if available.',
        'Hazardous': 'Stay indoors with filtered air. Avoid all outdoor activities.',
    }
    return mapping.get(category, 'Monitor conditions and stay informed about local advisories.')


def pollutant_name(code: str) -> str:
    return POLLUTANT_LABELS.get(code.lower(), code.upper())
