import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { logout } from '../services/authService';
import { Card } from '../components';
import { colors, typography } from '../theme';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
    color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, onPress, color }) => (
    <TouchableOpacity style={styles.cardWrapper} onPress={onPress} activeOpacity={0.7}>
        <Card style={styles.featureCard}>
            <View style={[styles.iconCircle, { backgroundColor: color }]}>
                <Text style={styles.cardIcon}>{icon}</Text>
            </View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
        </Card>
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
                <View>
                    <Text style={styles.greeting}>Welcome! 👋</Text>
                    <Text style={styles.headerTitle}>Dashboard</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>Your Tools</Text>

                <View style={styles.grid}>
                    <FeatureCard
                        title="Disease Detection"
                        description="Identify plant diseases"
                        icon="🔍"
                        color={colors.success}
                        onPress={() => navigation.navigate('Disease')}
                    />
                    <FeatureCard
                        title="Crop Recommend"
                        description="Get crop suggestions"
                        icon="🌾"
                        color={colors.secondary}
                        onPress={() => navigation.navigate('Crops')}
                    />
                    <FeatureCard
                        title="Weather"
                        description="Check weather forecast"
                        icon="☁️"
                        color={colors.info}
                        onPress={() => navigation.navigate('Weather')}
                    />
                    <FeatureCard
                        title="Profit Compare"
                        description="Compare crop profits"
                        icon="📈"
                        color="#ff9800"
                        onPress={() => navigation.navigate('ProfitComparison')}
                    />
                    <FeatureCard
                        title="Schemes"
                        description="Gov. compensation"
                        icon="🛡️"
                        color="#e91e63"
                        onPress={() => navigation.navigate('SchemeFilter')}
                    />
                    <FeatureCard
                        title="Marketplace"
                        description="Rent & hire services"
                        icon="🏪"
                        color="#E65100"
                        onPress={() => navigation.navigate('Marketplace')}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 24,
        paddingTop: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    greeting: {
        fontSize: typography.fontSizes.sm,
        color: colors.textLight,
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: typography.fontSizes.xxl,
        fontWeight: typography.fontWeights.bold,
        color: colors.text,
    },
    logoutButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: colors.error + '15',
    },
    logoutText: {
        color: colors.error,
        fontWeight: typography.fontWeights.semibold,
        fontSize: typography.fontSizes.sm,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: typography.fontSizes.lg,
        fontWeight: typography.fontWeights.semibold,
        marginBottom: 16,
        color: colors.text,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: '48%',
        marginBottom: 16,
    },
    featureCard: {
        alignItems: 'center',
        padding: 20,
        minHeight: 160,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardIcon: {
        fontSize: 28,
    },
    cardTitle: {
        fontSize: typography.fontSizes.md,
        fontWeight: typography.fontWeights.bold,
        color: colors.text,
        marginBottom: 6,
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: typography.fontSizes.xs,
        color: colors.textLight,
        textAlign: 'center',
        lineHeight: 16,
    },
});

export default HomeScreen;
