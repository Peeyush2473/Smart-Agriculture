from pydantic import BaseModel
from typing import List, Optional

class WeatherCurrent(BaseModel):
    temperature: float
    condition: str
    humidity: float
    wind_speed: float

class WeatherForecastItem(BaseModel):
    date: str
    temperature_max: float
    temperature_min: float
    condition: str
    rain_probability: float

class WeatherResponse(BaseModel):
    current: WeatherCurrent
    forecast: List[WeatherForecastItem]
    alerts: List[str] = []
