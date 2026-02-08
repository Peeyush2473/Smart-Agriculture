import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, typography } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
}) => {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle = styles.button;
        switch (variant) {
            case 'primary':
                return { ...baseStyle, backgroundColor: colors.primary };
            case 'secondary':
                return { ...baseStyle, backgroundColor: colors.secondary };
            case 'outline':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: colors.primary,
                };
            default:
                return baseStyle;
        }
    };

    const getTextStyle = (): TextStyle => {
        return variant === 'outline'
            ? { ...styles.buttonText, color: colors.primary }
            : styles.buttonText;
    };

    return (
        <TouchableOpacity
            style={[
                getButtonStyle(),
                disabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonText: {
        color: colors.white,
        fontSize: typography.fontSizes.md,
        fontWeight: typography.fontWeights.bold,
    },
    disabled: {
        backgroundColor: colors.disabled,
        opacity: 0.6,
    },
});
