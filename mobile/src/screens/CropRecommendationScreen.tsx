import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { recommendCrops } from '../services/featureService';

const CropRecommendationScreen = () => {
    const [form, setForm] = useState({ N: '90', P: '42', K: '43', temperature: '20', humidity: '82', ph: '6.5', rainfall: '202' });
    const [loading, setLoading] = useState(false);
    const [crops, setCrops] = useState<string[] | null>(null);

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Convert strings to numbers
            const params = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, parseFloat(v)]));
            const response = await recommendCrops(params);
            setCrops(response.recommended_crops);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to get recommendations');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.form}>
                <View style={styles.row}>
                    <TextInput style={styles.input} placeholder="N (Nitrogen)" keyboardType="numeric" value={form.N} onChangeText={t => handleChange('N', t)} />
                    <TextInput style={styles.input} placeholder="P (Phosphorus)" keyboardType="numeric" value={form.P} onChangeText={t => handleChange('P', t)} />
                </View>
                <View style={styles.row}>
                    <TextInput style={styles.input} placeholder="K (Potassium)" keyboardType="numeric" value={form.K} onChangeText={t => handleChange('K', t)} />
                    <TextInput style={styles.input} placeholder="pH Level" keyboardType="numeric" value={form.ph} onChangeText={t => handleChange('ph', t)} />
                </View>
                <TextInput style={styles.input} placeholder="Temperature (°C)" keyboardType="numeric" value={form.temperature} onChangeText={t => handleChange('temperature', t)} />
                <TextInput style={styles.input} placeholder="Humidity (%)" keyboardType="numeric" value={form.humidity} onChangeText={t => handleChange('humidity', t)} />
                <TextInput style={styles.input} placeholder="Rainfall (mm)" keyboardType="numeric" value={form.rainfall} onChangeText={t => handleChange('rainfall', t)} />

                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Get Recommendation</Text>}
                </TouchableOpacity>
            </View>

            {crops && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultHeader}>Recommended Crops:</Text>
                    <View style={styles.tags}>
                        {crops.map((crop, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{crop}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    form: { backgroundColor: '#fff', padding: 15, borderRadius: 10, elevation: 2, marginTop: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    input: { flex: 1, backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee', marginHorizontal: 5 },
    button: { backgroundColor: '#ff9800', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    resultContainer: { marginTop: 30 },
    resultHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    tags: { flexDirection: 'row', flexWrap: 'wrap' },
    tag: { backgroundColor: '#e0f7fa', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#00bcd4' },
    tagText: { color: '#006064', fontWeight: 'bold' },
});

export default CropRecommendationScreen;
