import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getWeather } from '../services/featureService';
import { WeatherData } from '../types';
import { Card } from '../components';
import { colors, typography } from '../theme';

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

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.info} /></View>;
    if (!data) return <View style={styles.center}><Text style={styles.errorText}>Failed to load weather</Text></View>;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <Card style={styles.currentCard}>
                <Text style={styles.conditionIcon}>☁️</Text>
                <Text style={styles.condition}>{data.current.condition}</Text>
                <Text style={styles.temp}>{data.current.temperature}°C</Text>
                <View style={styles.details}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailIcon}>💧</Text>
                        <Text style={styles.detailText}>{data.current.humidity}%</Text>
                        <Text style={styles.detailLabel}>Humidity</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailIcon}>💨</Text>
                        <Text style={styles.detailText}>{data.current.wind_speed} km/h</Text>
                        <Text style={styles.detailLabel}>Wind</Text>
                    </View>
                </View>
            </Card>

            <Text style={styles.sectionTitle}>7-Day Forecast</Text>
            {data.forecast.map((item, index) => (
                <Card key={index} style={styles.forecastCard}>
                    <View style={styles.forecastItem}>
                        <Text style={styles.day}>{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                        <Text style={styles.forecastCondition}>{item.condition}</Text>
                        <Text style={styles.range}>{item.temperature_min.toFixed(0)}° - {item.temperature_max.toFixed(0)}°</Text>
                    </View>
                </Card>
            ))}

            {data.alerts.length > 0 && (
                <Card style={styles.alertCard}>
                    <Text style={styles.alertTitle}>⚠️ Weather Alerts</Text>
                    {data.alerts.map((alert, i) => <Text key={i} style={styles.alertText}>{alert}</Text>)}
                </Card>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorText: {
        fontSize: typography.fontSizes.md,
        color: colors.error,
    },
    currentCard: {
        backgroundColor: colors.info,
        alignItems: 'center',
        padding: 32,
        marginBottom: 24,
        marginTop: 20,
    },
    conditionIcon: {
        fontSize: 64,
        marginBottom: 8,
    },
    condition: {
        color: colors.white,
        fontSize: typography.fontSizes.xl,
        fontWeight: typography.fontWeights.semibold,
        marginBottom: 8,
    },
    temp: {
        color: colors.white,
        fontSize: 72,
        fontWeight: typography.fontWeights.bold,
        marginBottom: 24,
    },
    details: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
    },
    detailItem: {
        alignItems: 'center',
    },
    detailIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    detailText: {
        color: colors.white,
        fontSize: typography.fontSizes.lg,
        fontWeight: typography.fontWeights.bold,
    },
    detailLabel: {
        color: colors.white + 'CC',
        fontSize: typography.fontSizes.xs,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: typography.fontSizes.lg,
        fontWeight: typography.fontWeights.semibold,
        marginBottom: 12,
        color: colors.text,
    },
    forecastCard: {
        marginBottom: 8,
    },
    forecastItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    day: {
        fontWeight: typography.fontWeights.semibold,
        width: 80,
        color: colors.text,
        fontSize: typography.fontSizes.sm,
    },
    forecastCondition: {
        flex: 1,
        textAlign: 'center',
        color: colors.textLight,
        fontSize: typography.fontSizes.sm,
    },
    range: {
        color: colors.text,
        fontWeight: typography.fontWeights.medium,
        fontSize: typography.fontSizes.sm,
    },
    alertCard: {
        marginTop: 16,
        backgroundColor: colors.error + '10',
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    alertTitle: {
        color: colors.error,
        fontWeight: typography.fontWeights.bold,
        marginBottom: 8,
        fontSize: typography.fontSizes.md,
    },
    alertText: {
        color: colors.error,
        fontSize: typography.fontSizes.sm,
        marginTop: 4,
    },
});

export default WeatherScreen;
