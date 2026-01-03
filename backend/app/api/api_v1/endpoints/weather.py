from fastapi import APIRouter, Depends
from app.schemas.weather import WeatherResponse, WeatherCurrent, WeatherForecastItem
from app.api import deps
import random
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/", response_model=WeatherResponse)
def get_weather(
    lat: float,
    lon: float,
    current_user = Depends(deps.get_current_user)
):
    # Mock implementation
    # In real app: Call OpenWeatherMap API
    
    current = WeatherCurrent(
        temperature=28.5,
        condition="Sunny",
        humidity=60,
        wind_speed=12.5
    )
    
    forecast = []
    for i in range(7):
        date = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
        forecast.append(WeatherForecastItem(
            date=date,
            temperature_max=30.0 + random.uniform(-2, 2),
            temperature_min=20.0 + random.uniform(-2, 2),
            condition=random.choice(["Sunny", "Cloudy", "Rain"]),
            rain_probability=random.uniform(0, 100)
        ))
        
    return WeatherResponse(
        current=current,
        forecast=forecast,
        alerts=["Heatwave warning for next 2 days"] if random.random() > 0.7 else []
    )
