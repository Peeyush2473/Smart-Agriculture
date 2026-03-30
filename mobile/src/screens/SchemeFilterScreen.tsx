import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // You might need to install this if it's not present: expo install @react-native-picker/picker
import { Card, Button } from '../components';
import { colors, typography } from '../theme';

const INDIAN_STATES = [
    "ALL", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const SchemeFilterScreen = ({ navigation }: any) => {
    const [selectedState, setSelectedState] = useState("ALL");
    const [damageReason, setDamageReason] = useState("disease");

    const handleFindSchemes = () => {
        navigation.navigate('SchemeList', { state: selectedState, reason: damageReason });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.headerTitle}>Find Compensation Schemes</Text>
            <Text style={styles.headerSubtitle}>Tell us more to find eligible agricultural support schemes for you.</Text>
            
            <Card style={styles.card}>
                <Text style={styles.label}>Select Your State</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedState}
                        onValueChange={(itemValue: string) => setSelectedState(itemValue)}
                        style={Platform.OS === 'ios' ? {} : styles.picker}
                    >
                        {INDIAN_STATES.map((state) => (
                            <Picker.Item key={state} label={state === "ALL" ? "All States (Central Schemes)" : state} value={state} />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>Primary Cause of Crop Damage</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={damageReason}
                        onValueChange={(itemValue: string) => setDamageReason(itemValue)}
                        style={Platform.OS === 'ios' ? {} : styles.picker}
                    >
                        <Picker.Item label="Disease Infection" value="disease" />
                        <Picker.Item label="Pest Attack" value="pest" />
                        <Picker.Item label="Adverse Weather / Rain" value="weather" />
                        <Picker.Item label="Natural Calamity" value="natural_calamity" />
                        <Picker.Item label="Other / Unsure" value="all" />
                    </Picker>
                </View>
                
                <Button 
                    title="Find Schemes"
                    onPress={handleFindSchemes}
                    style={styles.button}
                />
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 24,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: typography.fontSizes.xl,
        fontWeight: typography.fontWeights.bold,
        color: colors.text,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: typography.fontSizes.md,
        color: colors.textLight,
        marginBottom: 24,
    },
    card: {
        padding: 20,
    },
    label: {
        fontSize: typography.fontSizes.md,
        fontWeight: typography.fontWeights.bold,
        color: colors.text,
        marginBottom: 8,
        marginTop: 12,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        backgroundColor: colors.surface,
    },
    picker: {
        height: 50,
        width: '100%',
    },
    button: {
        marginTop: 20,
    }
});

export default SchemeFilterScreen;
