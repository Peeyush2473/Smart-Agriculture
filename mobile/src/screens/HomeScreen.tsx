import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { logout } from '../services/authService';

const FeatureCard = ({ title, onPress, color }: any) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: color }]} onPress={onPress}>
        <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
);

const HomeScreen = ({ navigation }: any) => {
    const handleLogout = async () => {
        await logout();
        navigation.replace('Auth');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Tools</Text>
                <View style={styles.grid}>
                    <FeatureCard
                        title="Disease Detection"
                        color="#4caf50"
                        onPress={() => navigation.navigate('Disease')}
                    />
                    <FeatureCard
                        title="Crop Recommend"
                        color="#ff9800"
                        onPress={() => navigation.navigate('Crops')}
                    />
                    <FeatureCard
                        title="Weather"
                        color="#2196f3"
                        onPress={() => navigation.navigate('Weather')}
                    />
                    <FeatureCard
                        title="Advisory"
                        color="#9c27b0"
                        onPress={() => alert('Coming Soon')}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfc' },
    header: { padding: 20, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    logoutText: { color: 'red' },
    content: { padding: 20 },
    sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 15, color: '#555' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { width: '48%', height: 150, borderRadius: 15, padding: 15, justifyContent: 'flex-end', marginBottom: 15, elevation: 3 },
    cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default HomeScreen;
