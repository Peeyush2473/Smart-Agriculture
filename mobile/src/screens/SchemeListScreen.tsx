import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Linking, Alert, ActivityIndicator, Platform } from 'react-native';
import { Card, Button } from '../components';
import { colors, typography } from '../theme';
import { Scheme } from '../types';
import axios from 'axios';
import { scheduleSchemeReminder, registerForPushNotificationsAsync } from '../services/notificationService';
import { Ionicons } from '@expo/vector-icons';

const SchemeListScreen = ({ route }: any) => {
    const { state, reason } = route.params;
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchemes();
        // Request notification permissions when the screen mounts
        registerForPushNotificationsAsync();
    }, []);

    const fetchSchemes = async () => {
        try {
            setLoading(true);
            const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
            const response = await axios.post(`${baseUrl}/api/v1/schemes/suggest`, {
                state: state,
                damage_reason: reason
            });
            setSchemes(response.data.schemes);
        } catch (error) {
            console.error("Error fetching schemes:", error);
            Alert.alert("Error", "Could not fetch schemes. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = (url: string) => {
        Linking.openURL(url).catch((err) => console.error('An error occurred', err));
    };

    const handleRemindMe = async (schemeName: string, deadline: string) => {
        try {
            const id = await scheduleSchemeReminder(schemeName, deadline);
            if (id) {
                Alert.alert("Reminder Set", `We will remind you to apply for ${schemeName} before the deadline.`);
            } else {
                Alert.alert("Permission Required", "Please enable notifications to receive reminders.");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not set reminder.");
        }
    };

    const renderScheme = ({ item }: { item: Scheme }) => (
        <Card style={styles.card}>
            <View style={styles.cardHeader}>
                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
                <Text style={styles.schemeTitle}>{item.name}</Text>
            </View>
            
            <View style={styles.detailRow}>
                <Ionicons name="information-circle-outline" size={18} color={colors.textLight} />
                <Text style={styles.schemeDescription}>{item.description}</Text>
            </View>

            <View style={styles.detailRow}>
                <Ionicons name="gift-outline" size={18} color={colors.success} />
                <Text style={styles.sectionText}><Text style={styles.bold}>Benefits: </Text>{item.benefits}</Text>
            </View>

            <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={18} color={colors.secondary} />
                <Text style={styles.sectionText}><Text style={styles.bold}>Eligibility: </Text>{item.eligibility}</Text>
            </View>

            <View style={styles.deadlineRow}>
                <Ionicons name="time-outline" size={18} color={colors.error} />
                <Text style={styles.deadlineText}>Deadline: {item.deadline}</Text>
            </View>

            <View style={styles.actionRow}>
                <Button 
                    title="Apply Online"
                    onPress={() => handleApply(item.apply_link)}
                    style={styles.actionButton}
                />
                <Button 
                    title="Remind Me"
                    variant="secondary"
                    onPress={() => handleRemindMe(item.name, item.deadline)}
                    style={styles.actionButton}
                />
            </View>
        </Card>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Finding best schemes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Eligible Schemes</Text>
                <Text style={styles.headerSubtitle}>Based on your report: {state === 'ALL' ? 'Any State' : state} | {reason.toUpperCase()}</Text>
            </View>
            <FlatList
                data={schemes}
                keyExtractor={(item) => item.id}
                renderItem={renderScheme}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No matching schemes found for this criteria.</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: typography.fontSizes.md,
        color: colors.textLight,
    },
    header: {
        padding: 24,
        paddingTop: 40,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: typography.fontSizes.xl,
        fontWeight: typography.fontWeights.bold,
        color: colors.text,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: typography.fontSizes.sm,
        color: colors.textLight,
    },
    listContent: {
        padding: 16,
    },
    card: {
        padding: 16,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    schemeTitle: {
        fontSize: typography.fontSizes.lg,
        fontWeight: typography.fontWeights.bold,
        color: colors.text,
        flex: 1,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 8,
    },
    schemeDescription: {
        fontSize: typography.fontSizes.md,
        color: colors.textLight,
        flex: 1,
    },
    sectionText: {
        fontSize: typography.fontSizes.sm,
        color: colors.text,
        flex: 1,
        lineHeight: 20,
    },
    bold: {
        fontWeight: typography.fontWeights.bold,
    },
    deadlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
        padding: 8,
        backgroundColor: colors.error + '10',
        borderRadius: 8,
        gap: 8,
    },
    deadlineText: {
        fontSize: typography.fontSizes.sm,
        fontWeight: typography.fontWeights.bold,
        color: colors.error,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionButton: {
        flex: 1,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: typography.fontSizes.md,
        color: colors.textLight,
        marginTop: 40,
    }
});

export default SchemeListScreen;
