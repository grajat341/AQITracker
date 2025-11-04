from datetime import datetime
from typing import List, Optional, Literal

from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    latitude: float
    longitude: float


class PollutantReading(BaseModel):
    code: str = Field(..., description='Pollutant code e.g. pm25')
    name: str
    value: Optional[float] = Field(None, description='Latest observed value for the pollutant')
    unit: Optional[str] = Field(None, description='Measurement unit e.g. µg/m³ or ppm')
    aqi: Optional[int] = Field(None, description='AQI contribution for this pollutant')


class TrendPoint(BaseModel):
    time: str
    aqi: int


class AQIInsight(BaseModel):
    city: str
    country: str
    aqi: Optional[int] = Field(None, description='Overall AQI for the location if available')
    dominant_pollutant: Optional[str] = Field(None, alias='dominantPollutant')
    category: Optional[str] = None
    advice: Optional[str] = None
    timestamp: datetime
    coordinates: Optional[Coordinates] = None
    pollutants: List[PollutantReading] = Field(default_factory=list)
    trend: List[TrendPoint] = Field(default_factory=list)
    source: Literal['live', 'fallback'] = Field('live', description='Indicates whether data was retrieved from OpenAQ or fallback cache')

    class Config:
        allow_population_by_field_name = True


class AQIResponse(BaseModel):
    data: AQIInsight


class City(BaseModel):
    city: str
    country: str
    latitude: float
    longitude: float


class CityListResponse(BaseModel):
    data: List[City]


class HealthMessage(BaseModel):
    level: str
    advice: str
