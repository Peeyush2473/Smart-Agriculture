import api, { setAuthToken } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, User } from '../types';

export const login = async (username: string, password: string): Promise<User> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post<AuthResponse>('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    const { access_token } = response.data;
    await AsyncStorage.setItem('token', access_token);
    setAuthToken(access_token);

    // For simplicity, we just return a mock user object or decode token in real app
    // Here we assume successful login implies valid user
    return { id: 1, username, email: '' };
};

export const logout = async () => {
    await AsyncStorage.removeItem('token');
    setAuthToken('');
};

export const checkAuth = async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        setAuthToken(token);
        return true;
    }
    return false;
};

export const signup = async (username: string, email: string, password: string): Promise<User> => {
    const response = await api.post<User>('/auth/signup', {
        username,
        email,
        password,
    });
    return response.data;
};
