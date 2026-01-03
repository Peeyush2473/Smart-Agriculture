import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { detectDisease } from '../services/featureService';
import { DiseaseResult } from '../types';

const DiseaseScreen = () => {
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<DiseaseResult | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setResult(null);
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.granted === false) {
            Alert.alert("Permission Required", "Camera permission is required!");
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const data = await detectDisease(image);
            setResult(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to analyze image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.imageContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>No Image Selected</Text>
                    </View>
                )}
            </View>

            <View style={styles.controls}>
                <TouchableOpacity style={styles.button} onPress={pickImage}>
                    <Text style={styles.buttonText}>Upload Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.cameraButton]} onPress={takePhoto}>
                    <Text style={styles.buttonText}>Take Photo</Text>
                </TouchableOpacity>
            </View>

            {image && !result && (
                <TouchableOpacity style={[styles.button, styles.analyzeButton]} onPress={handleAnalyze} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Analyze Disease</Text>}
                </TouchableOpacity>
            )}

            {result && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Result: {result.disease_name}</Text>
                    <Text style={styles.confidence}>Confidence: {(result.confidence * 100).toFixed(1)}%</Text>
                    <Text style={styles.sectionHeader}>Treatment:</Text>
                    <Text style={styles.treatment}>{result.treatment}</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, alignItems: 'center' },
    imageContainer: { width: '100%', height: 300, borderRadius: 15, overflow: 'hidden', backgroundColor: '#eee', marginBottom: 20, marginTop: 20 },
    image: { width: '100%', height: '100%' },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: '#888' },
    controls: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginBottom: 20 },
    button: { backgroundColor: '#2196f3', padding: 12, borderRadius: 8, minWidth: 120, alignItems: 'center' },
    cameraButton: { backgroundColor: '#ff9800' },
    analyzeButton: { backgroundColor: '#4caf50', width: '100%' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    resultContainer: { backgroundColor: '#e8f5e9', padding: 20, borderRadius: 10, width: '100%', marginTop: 20 },
    resultTitle: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32', marginBottom: 5 },
    confidence: { color: '#666', marginBottom: 10 },
    sectionHeader: { fontWeight: 'bold', marginTop: 10 },
    treatment: { marginTop: 5, lineHeight: 20 },
});

export default DiseaseScreen;
