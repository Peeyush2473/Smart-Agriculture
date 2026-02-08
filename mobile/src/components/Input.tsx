import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, typography } from '../theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error && styles.inputError,
                    style,
                ]}
                placeholderTextColor={colors.textSecondary}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: typography.fontSizes.sm,
        fontWeight: typography.fontWeights.medium,
        color: colors.text,
        marginBottom: 6,
    },
    input: {
        backgroundColor: colors.surface,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: typography.fontSizes.md,
        color: colors.text,
    },
    inputError: {
        borderColor: colors.error,
    },
    errorText: {
        fontSize: typography.fontSizes.xs,
        color: colors.error,
        marginTop: 4,
    },
});
