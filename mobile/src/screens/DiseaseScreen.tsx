import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { detectDisease } from '../services/featureService';
import { DiseaseResult } from '../types';
import { Card, Button } from '../components';
import { colors, typography } from '../theme';

const DiseaseScreen = ({ navigation }: any) => {
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

    const handleRemoveImage = () => {
        setImage(null);
        setResult(null);
    };

    const isHealthy = result?.disease_name?.toLowerCase().includes('healthy');
    const statusColor = isHealthy ? colors.success : colors.error;

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
                        <Ionicons name="scan-outline" size={32} color={colors.primary} />
                    </View>
                    <Text style={styles.headerTitle}>Disease Detection</Text>
                    <Text style={styles.headerSubtitle}>Identify plant diseases instantly</Text>
                </View>

                {!image ? (
                    <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickImage} activeOpacity={0.8}>
                        <View style={styles.uploadIconCircle}>
                            <Ionicons name="camera-outline" size={32} color={colors.primary} />
                        </View>
                        <Text style={styles.uploadTitle}>Tap to Upload Image</Text>
                        <Text style={styles.uploadSubtitle}>or choose from gallery</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: image }} style={styles.previewImage} />
                        <TouchableOpacity style={styles.removeButton} onPress={handleRemoveImage}>
                            <Ionicons name="close" size={20} color={colors.white} />
                        </TouchableOpacity>

                        {!result && (
                            <View style={styles.analyzeOverlay}>
                                <Button
                                    title="Analyze Disease"
                                    onPress={handleAnalyze}
                                    loading={loading}
                                    variant="primary"
                                    style={styles.analyzeButton}
                                />
                            </View>
                        )}
                    </View>
                )}

                {!image && (
                    <Button
                        title="Take Photo"
                        onPress={takePhoto}
                        variant="secondary"
                        style={styles.actionButton}
                    />
                )}

                {result && (
                    <Card style={[styles.resultCard, { borderColor: statusColor }]}>
                        <View style={styles.resultHeader}>
                            <View style={[styles.statusIcon, { backgroundColor: statusColor + '20' }]}>
                                <Ionicons
                                    name={isHealthy ? "checkmark-circle" : "alert-circle"}
                                    size={32}
                                    color={statusColor}
                                />
                            </View>
                            <View style={styles.resultHeaderText}>
                                <Text style={styles.resultTitle}>
                                    {result.disease_name.replace(/_/g, ' ')}
                                </Text>
                                <View style={styles.confidenceBadge}>
                                    <Text style={[styles.confidenceText, { color: statusColor }]}>
                                        {(result.confidence * 100).toFixed(1)}% Confidence
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.treatmentSection}>
                            <View style={styles.sectionTitleRow}>
                                <Ionicons name="medkit-outline" size={20} color={colors.text} />
                                <Text style={styles.sectionTitle}>Treatment & Care</Text>
                            </View>
                            <Text style={styles.treatmentText}>{result.treatment}</Text>
                        </View>
                    </Card>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        marginTop: 20,
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
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    headerIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: typography.fontSizes.xxl,
        fontWeight: typography.fontWeights.bold,
        color: colors.text,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: typography.fontSizes.md,
        color: colors.textLight,
        textAlign: 'center',
    },
    uploadPlaceholder: {
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: 24,
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginBottom: 24,
    },
    uploadIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    uploadTitle: {
        fontSize: typography.fontSizes.lg,
        fontWeight: typography.fontWeights.bold,
        color: colors.text,
        marginBottom: 4,
    },
    uploadSubtitle: {
        fontSize: typography.fontSizes.sm,
        color: colors.textSecondary,
    },
    imageContainer: {
        height: 320,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
        position: 'relative',
        backgroundColor: colors.black,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    analyzeOverlay: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
    },
    analyzeButton: {
        width: '100%',
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    actionButton: {
        width: '100%',
    },
    resultCard: {
        borderWidth: 1.5,
        padding: 24,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    statusIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    resultHeaderText: {
        flex: 1,
        justifyContent: 'center',
    },
    resultTitle: {
        fontSize: typography.fontSizes.xl,
        fontWeight: typography.fontWeights.bold,
        color: colors.text,
        marginBottom: 6,
        flexWrap: 'wrap',
    },
    confidenceBadge: {
        backgroundColor: colors.background,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    confidenceText: {
        fontSize: typography.fontSizes.xs,
        fontWeight: typography.fontWeights.bold,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 20,
    },
    treatmentSection: {
        gap: 8,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: typography.fontSizes.md,
        fontWeight: typography.fontWeights.bold,
        color: colors.text,
    },
    treatmentText: {
        fontSize: typography.fontSizes.md,
        color: colors.textLight,
        lineHeight: 24,
    },
});

export default DiseaseScreen;
