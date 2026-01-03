import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getWeather } from '../services/featureService';
import { WeatherData } from '../types';

const WeatherScreen = () => {
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock location for Delhi, India
        loadWeather(28.7041, 77.1025);
    }, []);

    const loadWeather = async (lat: number, lon: number) => {
        try {
            const result = await getWeather(lat, lon);
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2196f3" /></View>;
    if (!data) return <View style={styles.center}><Text>Failed to load weather</Text></View>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.currentCard}>
                <Text style={styles.condition}>{data.current.condition}</Text>
                <Text style={styles.temp}>{data.current.temperature}°C</Text>
                <View style={styles.details}>
                    <Text>Humidity: {data.current.humidity}%</Text>
                    <Text>Wind: {data.current.wind_speed} km/h</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>7-Day Forecast</Text>
            {data.forecast.map((item, index) => (
                <View key={index} style={styles.forecastItem}>
                    <Text style={styles.day}>{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                    <Text style={styles.forecastCondition}>{item.condition}</Text>
                    <Text style={styles.range}>{item.temperature_min.toFixed(0)} - {item.temperature_max.toFixed(0)}°</Text>
                </View>
            ))}

            {data.alerts.length > 0 && (
                <View style={styles.alertContainer}>
                    <Text style={styles.alertTitle}>⚠️ Alerts</Text>
                    {data.alerts.map((alert, i) => <Text key={i} style={styles.alertText}>{alert}</Text>)}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    currentCard: { backgroundColor: '#2196f3', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 30, marginTop: 20 },
    condition: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    temp: { color: '#fff', fontSize: 64, fontWeight: 'bold' },
    details: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 10 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    forecastItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', marginBottom: 10, borderRadius: 10 },
    day: { fontWeight: 'bold', width: 50 },
    forecastCondition: { flex: 1, textAlign: 'center' },
    range: { color: '#666' },
    alertContainer: { marginTop: 20, padding: 15, backgroundColor: '#ffebee', borderRadius: 10, borderWidth: 1, borderColor: '#ef5350' },
    alertTitle: { color: '#d32f2f', fontWeight: 'bold', marginBottom: 5 },
    alertText: { color: '#c62828' }
});

export default WeatherScreen;
