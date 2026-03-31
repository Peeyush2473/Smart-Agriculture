import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from '../screens/AuthScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import DiseaseScreen from '../screens/DiseaseScreen';
import CropRecommendationScreen from '../screens/CropRecommendationScreen';
import WeatherScreen from '../screens/WeatherScreen';
import ProfitComparisonScreen from '../screens/ProfitComparisonScreen';
import SchemeFilterScreen from '../screens/SchemeFilterScreen';
import SchemeListScreen from '../screens/SchemeListScreen';
import MarketPlaceScreen from '../screens/MarketplaceScreen';

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
                <Stack.Screen name="ProfitComparison" component={ProfitComparisonScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SchemeFilter" component={SchemeFilterScreen} options={{ title: 'Find Schemes' }} />
                <Stack.Screen name="SchemeList" component={SchemeListScreen} options={{ title: 'Available Schemes' }} />
                <Stack.Screen name="Marketplace" component={MarketPlaceScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
