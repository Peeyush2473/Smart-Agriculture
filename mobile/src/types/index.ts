export interface User {
    id: number;
    username: string;
    email: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface DiseaseResult {
    disease_name: string;
    confidence: number;
    treatment?: string;
    description?: string;
}

export interface CropResponse {
    recommended_crops: string[];
    confidence: number;
}

export interface WeatherCurrent {
    temperature: number;
    condition: string;
    humidity: number;
    wind_speed: number;
}

export interface WeatherForecastItem {
    date: string;
    temperature_max: number;
    temperature_min: number;
    condition: string;
    rain_probability: number;
}

export interface WeatherData {
    current: WeatherCurrent;
    forecast: WeatherForecastItem[];
    alerts: string[];
}
