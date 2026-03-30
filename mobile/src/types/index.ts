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
    symptoms?: string;
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

export interface CropComparisonInput {
    crop_name: string;
    cultivation_cost: number;
    expected_yield: number;
    market_price: number;
    weather_condition: 'good' | 'average' | 'poor';
}

export interface CropProfitResult {
    crop_name: string;
    revenue: number;
    total_cost: number;
    net_profit: number;
    roi_percentage: number;
    rank: number;
}

export interface ProfitComparisonRequest {
    crops: CropComparisonInput[];
}


export interface ProfitResponse {
    comparison_results: CropProfitResult[];
}

export interface Scheme {
    id: string;
    name: string;
    description: string;
    benefits: string;
    eligibility: string;
    deadline: string;
    apply_link: string;
}

export interface SchemeSuggestionResponse {
    schemes: Scheme[];
}

