import axios from 'axios';
import { Platform } from 'react-native';

const DEV_API_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api/v1'
    : 'http://localhost:8000/api/v1';

// Replace with your machine's IP if running on real device
// const DEV_API_URL = 'http://192.168.1.5:8000/api/v1';

const api = axios.create({
    baseURL: DEV_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token: string) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
