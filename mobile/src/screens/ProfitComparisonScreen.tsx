import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components';
import { Input } from '../components/Input';
import { colors, typography } from '../theme';
import { CropComparisonInput, ProfitResponse } from '../types';
import { compareProfit } from '../services/featureService';

type WeatherCondition = 'good' | 'average' | 'poor';

const defaultCrops: CropComparisonInput[] = [
    { crop_name: 'Wheat', cultivation_cost: 20000, expected_yield: 30, market_price: 2000, weather_condition: 'average' },
    { crop_name: 'Rice', cultivation_cost: 25000, expected_yield: 40, market_price: 1800, weather_condition: 'good' }
];

const ProfitComparisonScreen = ({ navigation }: any) => {
    const [crops, setCrops] = useState<CropComparisonInput[]>(defaultCrops);
    const [result, setResult] = useState<ProfitResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const updateCrop = (index: number, field: keyof CropComparisonInput, value: string | number) => {
        const newCrops = [...crops];
        // @ts-ignore
        newCrops[index][field] = value;
        setCrops(newCrops);
        setResult(null); // Clear previous results when inputs change
    };

    const addCrop = () => {
        setCrops([...crops, { crop_name: 'New Crop', cultivation_cost: 0, expected_yield: 0, market_price: 0, weather_condition: 'average' }]);
        setResult(null);
    };

    const removeCrop = (index: number) => {
        if (crops.length <= 1) {
            Alert.alert("Cannot remove", "You need at least one crop to compare.");
            return;
        }
        const newCrops = crops.filter((_, i) => i !== index);
        setCrops(newCrops);
        setResult(null);
    };

    const handleCompare = async () => {
        if (crops.length === 0) return;
        setLoading(true);
        try {
            // Convert string inputs to numbers in case they were entered as strings
            const formattedCrops = crops.map(c => ({
                ...c,
                cultivation_cost: Number(String(c.cultivation_cost).replace(/[^0-9.]/g, '')),
                expected_yield: Number(String(c.expected_yield).replace(/[^0-9.]/g, '')),
                market_price: Number(String(c.market_price).replace(/[^0-9.]/g, ''))
            }));
            const response = await compareProfit({ crops: formattedCrops });
            setResult(response);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to compare profitability.");
        } finally {
            setLoading(false);
        }
    };

    const renderWeatherSelector = (index: number, current: WeatherCondition) => {
        const options: { label: string; value: WeatherCondition }[] = [
            { label: 'Good', value: 'good' },
            { label: 'Average', value: 'average' },
            { label: 'Poor', value: 'poor' }
        ];

        return (
            <View style={styles.weatherSegmentContainer}>
                <Text style={styles.weatherLabel}>Weather Condition</Text>
                <View style={styles.weatherSegment}>
                    {options.map((opt) => {
                        const isSelected = current === opt.value;
                        return (
                            <TouchableOpacity
                                key={opt.value}
                                style={[styles.weatherSegmentButton, isSelected && styles.weatherSegmentButtonActive]}
                                onPress={() => updateCrop(index, 'weather_condition', opt.value)}
                            >
                                <Text style={[styles.weatherSegmentText, isSelected && styles.weatherSegmentTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
            >
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.headerIconContainer}>
                        <Ionicons name="stats-chart" size={32} color={colors.primary} />
                    </View>
                    <Text style={styles.headerTitle}>Profit Comparison</Text>
                    <Text style={styles.headerSubtitle}>Compare ROI across multiple crops</Text>
                </View>

                {crops.map((crop, index) => (
                    <Card key={`crop-${index}`} style={styles.cropCard}>
                        <View style={styles.cropCardHeader}>
                            <Text style={styles.cropCardTitle}>Crop {index + 1}</Text>
                            <TouchableOpacity onPress={() => removeCrop(index)} style={styles.removeCropButton}>
                                <Ionicons name="trash-outline" size={20} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                        
                        <Input
                            label="Crop Name"
                            value={crop.crop_name}
                            onChangeText={(text) => updateCrop(index, 'crop_name', text)}
                            placeholder="e.g. Wheat"
                        />
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Input
                                    label="Cultivation Cost"
                                    value={String(crop.cultivation_cost)}
                                    onChangeText={(text) => updateCrop(index, 'cultivation_cost', text)}
                                    keyboardType="numeric"
                                    placeholder="Cost / hectare"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Input
                                    label="Expected Yield"
                                    value={String(crop.expected_yield)}
                                    onChangeText={(text) => updateCrop(index, 'expected_yield', text)}
                                    keyboardType="numeric"
                                    placeholder="Yield unit"
                                />
                            </View>
                        </View>
                        <Input
                            label="Market Price (per unit)"
                            value={String(crop.market_price)}
                            onChangeText={(text) => updateCrop(index, 'market_price', text)}
                            keyboardType="numeric"
                            placeholder="Price per unit"
                        />
                        {renderWeatherSelector(index, crop.weather_condition as WeatherCondition)}
                    </Card>
                ))}

                <Button
                    title="+ Add Another Crop"
                    onPress={addCrop}
                    variant="outline"
                    style={styles.addButton}
                />

                <Button
                    title="Compare Profitability"
                    onPress={handleCompare}
                    loading={loading}
                    variant="primary"
                    style={styles.compareButton}
                />

                {result && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsTitle}>Comparison Results</Text>
                        {result.comparison_results.map((res: any, i: number) => (
                            <Card key={`res-${i}`} style={[styles.resultCard, i === 0 && styles.firstRankCard]}>
                                <View style={styles.resultHeader}>
                                    <View style={[styles.rankCircle, i === 0 && styles.rankCircleFirst]}>
                                        <Text style={[styles.rankText, i === 0 && styles.rankTextFirst]}>#{res.rank}</Text>
                                    </View>
                                    <Text style={[styles.resultCropName, i === 0 && styles.resultCropNameFirst]}>{res.crop_name}</Text>
                                </View>
                                <View style={styles.resultBody}>
                                    <View style={styles.resultStat}>
                                        <Text style={styles.resultStatLabel}>Net Profit</Text>
                                        <Text style={[styles.resultStatValue, i === 0 && styles.firstRankValue]}>₹{res.net_profit.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.resultStat}>
                                        <Text style={styles.resultStatLabel}>ROI</Text>
                                        <Text style={styles.resultStatValue}>{res.roi_percentage}%</Text>
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, marginTop: 20 },
    backButton: {
        position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, left: 20, zIndex: 10, padding: 8,
        borderRadius: 20, backgroundColor: colors.white, elevation: 2, shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
    },
    scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 40 },
    header: { alignItems: 'center', marginBottom: 24 },
    headerIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    headerTitle: { fontSize: typography.fontSizes.xxl, fontWeight: typography.fontWeights.bold, color: colors.text, marginBottom: 8 },
    headerSubtitle: { fontSize: typography.fontSizes.md, color: colors.textLight, textAlign: 'center' },
    cropCard: { marginBottom: 16, padding: 16 },
    cropCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cropCardTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.primary },
    removeCropButton: { padding: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    weatherSegmentContainer: { marginTop: 8 },
    weatherLabel: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.text, marginBottom: 6 },
    weatherSegment: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    weatherSegmentButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
    weatherSegmentButtonActive: { backgroundColor: colors.primary + '20' },
    weatherSegmentText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
    weatherSegmentTextActive: { color: colors.primary, fontWeight: typography.fontWeights.bold },
    addButton: { marginBottom: 24, borderStyle: 'dashed' },
    compareButton: { marginBottom: 32, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    resultsContainer: { marginTop: 16 },
    resultsTitle: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, marginBottom: 16, color: colors.text },
    resultCard: { padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    firstRankCard: { borderColor: colors.primary, backgroundColor: colors.primary + '05', borderWidth: 2 },
    resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    rankCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    rankCircleFirst: { backgroundColor: colors.primary },
    rankText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.bold, color: colors.textSecondary },
    rankTextFirst: { color: colors.white },
    resultCropName: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.text },
    resultCropNameFirst: { color: colors.primary },
    resultBody: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
    resultStat: { flex: 1 },
    resultStatLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: 4 },
    resultStatValue: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.text },
    firstRankValue: { color: colors.success }
});

export default ProfitComparisonScreen;
