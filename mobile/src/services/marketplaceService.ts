import api from './api';
import {
    Equipment, EquipmentListResponse,
    LaborProvider, LaborProviderListResponse,
    Booking, BookingListResponse,
    Review, MarketplaceStats,
    EquipmentCreateInput,
} from '../types';

// ─── Stats ──────────────────────────────────────────────────────────────────

export const getMarketplaceStats = async (): Promise<MarketplaceStats> => {
    const response = await api.get<MarketplaceStats>('/marketplace/stats');
    return response.data;
};

export const seedMarketplace = async (): Promise<{ message: string }> => {
    const response = await api.post('/marketplace/seed');
    return response.data;
};

// ─── Equipment ──────────────────────────────────────────────────────────────

export const getEquipmentList = async (params?: {
    category?: string;
    location?: string;
    q?: string;
    available_only?: boolean;
    page?: number;
    page_size?: number;
}): Promise<EquipmentListResponse> => {
    const response = await api.get<EquipmentListResponse>('/marketplace/equipment', { params });
    return response.data;
};

export const getEquipmentById = async (id: number): Promise<Equipment> => {
    const response = await api.get<Equipment>(`/marketplace/equipment/${id}`);
    return response.data;
};

export const createEquipment = async (data: EquipmentCreateInput): Promise<Equipment> => {
    const response = await api.post<Equipment>('/marketplace/equipment', data);
    return response.data;
};


// ─── Labor Providers ────────────────────────────────────────────────────────

export const getLaborList = async (params?: {
    skills?: string;
    location?: string;
    q?: string;
    available_only?: boolean;
    page?: number;
    page_size?: number;
}): Promise<LaborProviderListResponse> => {
    const response = await api.get<LaborProviderListResponse>('/marketplace/labor', { params });
    return response.data;
};

export const getLaborById = async (id: number): Promise<LaborProvider> => {
    const response = await api.get<LaborProvider>(`/marketplace/labor/${id}`);
    return response.data;
};

// ─── Bookings ───────────────────────────────────────────────────────────────

export const createBooking = async (data: {
    booking_type: 'equipment' | 'labor';
    equipment_id?: number;
    labor_provider_id?: number;
    start_date: string;
    end_date: string;
    notes?: string;
}): Promise<Booking> => {
    const response = await api.post<Booking>('/marketplace/bookings', data);
    return response.data;
};

export const getMyBookings = async (): Promise<BookingListResponse> => {
    const response = await api.get<BookingListResponse>('/marketplace/bookings');
    return response.data;
};

export const updateBooking = async (
    id: number,
    data: { status?: string; notes?: string },
): Promise<Booking> => {
    const response = await api.put<Booking>(`/marketplace/bookings/${id}`, data);
    return response.data;
};

// ─── Reviews ────────────────────────────────────────────────────────────────

export const createReview = async (data: {
    equipment_id?: number;
    labor_provider_id?: number;
    rating: number;
    comment?: string;
}): Promise<Review> => {
    const response = await api.post<Review>('/marketplace/reviews', data);
    return response.data;
};

export const getEquipmentReviews = async (equipmentId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/marketplace/reviews/equipment/${equipmentId}`);
    return response.data;
};

export const getLaborReviews = async (providerId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/marketplace/reviews/labor/${providerId}`);
    return response.data;
};
