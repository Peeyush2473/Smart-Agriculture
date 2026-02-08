import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { recommendCrops } from '../services/featureService';
import { Card, Button } from '../components';
import { colors, typography } from '../theme';

const { width } = Dimensions.get('window');
const INPUT_WIDTH = (width - 96) / 2;

interface InputFieldProps {
    label: string;
    icon: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    halfWidth?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, icon, placeholder, value, onChangeText, halfWidth }) => (
    <View style={[styles.inputContainer, halfWidth && { width: INPUT_WIDTH }]}>
        <View style={styles.labelRow}>
            <Text style={styles.inputIcon}>{icon}</Text>
            <Text style={styles.inputLabel}>{label}</Text>
        </View>
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={value}
            onChangeText={onChangeText}
        />
    </View>
);

const CropRecommendationScreen = ({ navigation }: any) => {
    const [form, setForm] = useState({ N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: '' });
    const [loading, setLoading] = useState(false);
    const [crops, setCrops] = useState<string[] | null>(null);

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
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
                        <Text style={styles.headerIcon}>🌾</Text>
                    </View>
                    <Text style={styles.headerTitle}>Crop Recommendation</Text>
                    <Text style={styles.headerSubtitle}>Get personalized crop suggestions</Text>
                </View>

                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>🧪</Text>
                        <Text style={styles.sectionTitle}>Soil Nutrients</Text>
                    </View>
                    <View style={styles.gridRow}>
                        <InputField
                            label="Nitrogen"
                            icon="N"
                            placeholder="e.g., 90"
                            value={form.N}
                            onChangeText={(t) => handleChange('N', t)}
                            halfWidth
                        />
                        <InputField
                            label="Phosphorus"
                            icon="P"
                            placeholder="e.g., 42"
                            value={form.P}
                            onChangeText={(t) => handleChange('P', t)}
                            halfWidth
                        />
                    </View>
                    <View style={styles.gridRow}>
                        <InputField
                            label="Potassium"
                            icon="K"
                            placeholder="e.g., 43"
                            value={form.K}
                            onChangeText={(t) => handleChange('K', t)}
                            halfWidth
                        />
                        <InputField
                            label="pH Level"
                            icon="⚗️"
                            placeholder="e.g., 6.5"
                            value={form.ph}
                            onChangeText={(t) => handleChange('ph', t)}
                            halfWidth
                        />
                    </View>
                </Card>

                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>🌡️</Text>
                        <Text style={styles.sectionTitle}>Environmental Conditions</Text>
                    </View>
                    <InputField
                        label="Temperature"
                        icon="🌡️"
                        placeholder="e.g., 25°C"
                        value={form.temperature}
                        onChangeText={(t) => handleChange('temperature', t)}
                    />
                    <InputField
                        label="Humidity"
                        icon="💧"
                        placeholder="e.g., 82%"
                        value={form.humidity}
                        onChangeText={(t) => handleChange('humidity', t)}
                    />
                    <InputField
                        label="Rainfall"
                        icon="🌧️"
                        placeholder="e.g., 202mm"
                        value={form.rainfall}
                        onChangeText={(t) => handleChange('rainfall', t)}
                    />
                </Card>

                <Button
                    title="Get Recommendations"
                    onPress={handleSubmit}
                    loading={loading}
                    variant="secondary"
                    style={styles.submitButton}
                />

                {crops && (
                    <Card style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <View style={styles.resultIconContainer}>
                                <Ionicons name="leaf" size={28} color={colors.success} />
                            </View>
                            <View style={styles.resultTextContainer}>
                                <Text style={styles.resultTitle}>Best Crops for You</Text>
                                <Text style={styles.resultSubtitle}>Based on your soil & climate</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.cropsGrid}>
                            {crops.map((crop, index) => (
                                <View key={index} style={styles.cropItem}>
                                    <View style={styles.cropIconBg}>
                                        <Ionicons name="nutrition-outline" size={18} color={colors.primary} />
                                    </View>
                                    <Text style={styles.cropName}>{crop}</Text>
                                </View>
                            ))}
                        </View>
                    </Card>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        flex: 1,
        backgroundColor: colors.background,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        left: 20,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.white,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 28,
        marginTop: 20,
    },
    headerIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.secondary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerIcon: {
        fontSize: 36,
    },
    headerTitle: {
        fontSize: typography.fontSizes.xxl,
        fontWeight: typography.fontWeights.bold,
        color: colors.text,
        marginBottom: 6,
    },
    headerSubtitle: {
        fontSize: typography.fontSizes.sm,
        color: colors.textLight,
    },
    section: {
        marginBottom: 16,
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sectionIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: typography.fontSizes.lg,
        fontWeight: typography.fontWeights.bold,
        color: colors.text,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    inputContainer: {
        marginBottom: 16,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    inputIcon: {
        fontSize: 16,
        marginRight: 6,
        width: 20,
        textAlign: 'center',
        fontWeight: typography.fontWeights.bold,
        color: colors.primary,
    },
    inputLabel: {
        fontSize: typography.fontSizes.sm,
        fontWeight: typography.fontWeights.medium,
        color: colors.text,
    },
    input: {
        backgroundColor: colors.surface,
        padding: 14,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colors.border,
        fontSize: typography.fontSizes.md,
        color: colors.text,
    },
    submitButton: {
        marginVertical: 8,
        elevation: 4,
    },
    resultCard: {
        marginTop: 24,
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.success + '40',
        elevation: 8,
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    resultIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.success + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    resultTextContainer: {
        flex: 1,
    },
    resultTitle: {
        fontSize: typography.fontSizes.xl,
        fontWeight: typography.fontWeights.bold,
        color: colors.text,
        marginBottom: 4,
    },
    resultSubtitle: {
        fontSize: typography.fontSizes.sm,
        color: colors.textLight,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 20,
    },
    cropsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    cropItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.success + '10',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.success + '20',
    },
    cropIconBg: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cropName: {
        fontSize: typography.fontSizes.md,
        fontWeight: typography.fontWeights.semibold,
        color: colors.text,
        textTransform: 'capitalize',
    },
});

export default CropRecommendationScreen;
