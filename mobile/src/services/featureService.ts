import api from './api';
import { CropResponse, DiseaseResult, WeatherData } from '../types';

export const detectDisease = async (imageUri: string): Promise<DiseaseResult> => {
    try {
        const formData = new FormData();

        // React Native FormData handling for images
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('file', { uri: imageUri, name: filename, type } as any);

        const response = await api.post<DiseaseResult>('/disease/detect', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 90000, // 90 seconds for disease detection (image upload + model inference)
        });
        return response.data;
    } catch (error: any) {
        console.error('Disease detection error:', error.message);
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. Please try with a smaller image or check your connection.');
        }
        throw error;
    }
};

export const recommendCrops = async (params: any): Promise<CropResponse> => {
    const response = await api.post<CropResponse>('/crops/recommend', params);
    return response.data;
};

export const getWeather = async (lat: number, lon: number): Promise<WeatherData> => {
    const response = await api.get<WeatherData>('/weather/', { params: { lat, lon } });
    return response.data;
};
