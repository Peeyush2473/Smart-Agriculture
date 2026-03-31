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

// ─── Marketplace Types ──────────────────────────────────────────────────────

export interface Equipment {
    id: number;
    owner_id: number;
    name: string;
    category: string;
    description?: string;
    daily_rate: number;
    hourly_rate?: number;
    location: string;
    latitude?: number;
    longitude?: number;
    is_available: boolean;
    condition: string;
    image_url?: string;
    avg_rating?: number;
    review_count: number;
    created_at?: string;
}

export interface EquipmentListResponse {
    items: Equipment[];
    total: number;
    page: number;
    page_size: number;
}

export interface LaborProvider {
    id: number;
    user_id: number;
    name: string;
    skills: string;
    experience_years: number;
    daily_rate: number;
    hourly_rate?: number;
    location: string;
    latitude?: number;
    longitude?: number;
    is_available: boolean;
    phone?: string;
    bio?: string;
    rating: number;
    total_jobs: number;
    review_count: number;
    created_at?: string;
}

export interface LaborProviderListResponse {
    items: LaborProvider[];
    total: number;
    page: number;
    page_size: number;
}

export interface Booking {
    id: number;
    user_id: number;
    booking_type: 'equipment' | 'labor';
    equipment_id?: number;
    labor_provider_id?: number;
    start_date: string;
    end_date: string;
    total_cost: number;
    status: string;
    notes?: string;
    equipment_name?: string;
    labor_provider_name?: string;
    created_at?: string;
}

export interface BookingListResponse {
    items: Booking[];
    total: number;
}

export interface Review {
    id: number;
    user_id: number;
    equipment_id?: number;
    labor_provider_id?: number;
    rating: number;
    comment?: string;
    reviewer_name?: string;
    created_at?: string;
}

export interface MarketplaceStats {
    total_equipment: number;
    total_labor_providers: number;
    total_bookings: number;
    available_equipment: number;
    available_labor: number;
}