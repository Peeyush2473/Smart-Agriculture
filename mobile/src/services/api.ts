import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detect if running on a real device or emulator
const isDevice = Constants.isDevice;

// Configuration
const MACHINE_IP = '172.25.220.163'; // Your machine's IP address on local network
const PORT = '8000';

// Smart URL selection based on platform and device type
const getApiUrl = () => {
    if (Platform.OS === 'android') {
        // Android emulator uses 10.0.2.2 to access host machine
        // Real Android device uses machine's IP address
        return isDevice
            ? `http://${MACHINE_IP}:${PORT}/api/v1`
            : `http://10.0.2.2:${PORT}/api/v1`;
    } else if (Platform.OS === 'ios') {
        // iOS simulator can use localhost
        // Real iOS device uses machine's IP address
        return isDevice
            ? `http://${MACHINE_IP}:${PORT}/api/v1`
            : `http://localhost:${PORT}/api/v1`;
    }
    // Fallback for web or other platforms
    return `http://localhost:${PORT}/api/v1`;
};

const DEV_API_URL = getApiUrl();

console.log(`API URL: ${DEV_API_URL} (Device: ${isDevice ? 'Real' : 'Emulator/Simulator'})`);

const api = axios.create({
    baseURL: DEV_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds timeout for image uploads and model inference
});

export const setAuthToken = (token: string) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;

