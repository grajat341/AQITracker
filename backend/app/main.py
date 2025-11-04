from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .schemas import AQIResponse, CityListResponse
from .services.openaq import get_aqi_for_city, list_cities

app = FastAPI(title='AQITracker API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.get('/api/cities', response_model=CityListResponse)
async def cities() -> CityListResponse:
    return CityListResponse(data=list_cities())


@app.get('/api/aqi/current', response_model=AQIResponse)
async def current_aqi(city: str = Query(..., description='City name e.g. Delhi')) -> AQIResponse:
    try:
        insight = await get_aqi_for_city(city)
        return AQIResponse(data=insight)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
