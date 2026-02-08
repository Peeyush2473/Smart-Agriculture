import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../theme';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
    return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        elevation: 3,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
});
