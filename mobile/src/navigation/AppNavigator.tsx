import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from '../screens/AuthScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import DiseaseScreen from '../screens/DiseaseScreen';
import CropRecommendationScreen from '../screens/CropRecommendationScreen';
import WeatherScreen from '../screens/WeatherScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Auth">
                <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Create Account' }} />
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Disease" component={DiseaseScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Crops" component={CropRecommendationScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Weather" component={WeatherScreen} options={{ title: 'Weather Intelligence' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
