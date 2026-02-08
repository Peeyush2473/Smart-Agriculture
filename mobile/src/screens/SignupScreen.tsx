import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { signup } from '../services/authService';
import { Button, Input } from '../components';
import { colors, typography } from '../theme';

const SignupScreen = ({ navigation }: any) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!username || !password || !email) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await signup(username, email, password);
            Alert.alert('Success', 'Account created successfully! Please login.', [
                { text: 'OK', onPress: () => navigation.navigate('Auth') }
            ]);
        } catch (error) {
            Alert.alert('Signup Failed', 'Username already exists or server error');
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
                        <Text style={styles.icon}>🌱</Text>
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join us to start your smart farming journey</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <Input
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Input
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Button
                        title="Sign Up"
                        onPress={handleSignup}
                        loading={loading}
                        style={styles.signupButton}
                    />

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.link}>
                            Already have an account? <Text style={styles.linkBold}>Login</Text>
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
    signupButton: {
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

export default SignupScreen;
