import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { login } from '../services/authService';
import { Button, Input } from '../components';
import { colors, typography } from '../theme';

const AuthScreen = ({ navigation }: any) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter username and password');
            return;
        }
        setLoading(true);
        try {
            await login(username, password);
            navigation.replace('Home');
        } catch (error) {
            Alert.alert('Login Failed', 'Invalid credentials or server error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🌾</Text>
                    </View>
                    <Text style={styles.title}>Safal Fasal</Text>
                    <Text style={styles.subtitle}>Welcome back! Sign in to continue</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <Input
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Button
                        title="Login"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginButton}
                    />

                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.link}>
                            Don't have an account? <Text style={styles.linkBold}>Sign up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    icon: {
        fontSize: 40,
    },
    title: {
        fontSize: typography.fontSizes.xxxl,
        fontWeight: typography.fontWeights.bold,
        color: colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: typography.fontSizes.md,
        color: colors.textLight,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    loginButton: {
        marginTop: 8,
        marginBottom: 24,
    },
    link: {
        textAlign: 'center',
        color: colors.textLight,
        fontSize: typography.fontSizes.md,
    },
    linkBold: {
        color: colors.primary,
        fontWeight: typography.fontWeights.bold,
    },
});

export default AuthScreen;
