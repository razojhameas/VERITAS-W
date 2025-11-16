import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen({ onLogin, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        organization: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return false;
        }

        if (!isLogin) {
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                return false;
            }
            if (!formData.firstName || !formData.lastName) {
                setError('First name and last name are required');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (isLogin) {
                const userData = {
                    id: 'user_' + Date.now(),
                    email: formData.email,
                    firstName: 'Demo',
                    lastName: 'User',
                    organization: 'Environmental Agency',
                    role: 'user',
                    joinDate: new Date().toISOString()
                };
                onLogin(userData);
            } else {
                const userData = {
                    id: 'user_' + Date.now(),
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    organization: formData.organization || 'Individual',
                    role: 'user',
                    joinDate: new Date().toISOString()
                };
                onLogin(userData);
            }
        } catch (err) {
            setError('Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            organization: ''
        });
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.authContainer, isMobile && styles.authContainerMobile]}>
                <View style={[styles.authCard, isMobile && styles.authCardMobile]}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                        <Ionicons name="shield-checkmark" size={48} color="#2E7D32" />
                        <Text style={[styles.title, isMobile && styles.titleMobile]}>
                            {isLogin ? 'Welcome Back' : 'Join VERITAS'}
                        </Text>
                        <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
                            {isLogin
                                ? 'Sign in to your VERITAS account'
                                : 'Create your account to access environmental justice data'
                            }
                        </Text>
                    </View>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning" size={20} color="#c33" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.form}>
                        {!isLogin && (
                            <>
                                <View style={[styles.nameRow, isMobile && styles.nameRowMobile]}>
                                    <View style={[styles.inputContainer, styles.halfInput, isMobile && styles.halfInputMobile]}>
                                        <Text style={styles.label}>First Name</Text>
                                        <TextInput
                                            style={[styles.input, isMobile && styles.inputMobile]}
                                            value={formData.firstName}
                                            onChangeText={(value) => handleInputChange('firstName', value)}
                                            placeholder="Enter your first name"
                                        />
                                    </View>
                                    <View style={[styles.inputContainer, styles.halfInput, isMobile && styles.halfInputMobile]}>
                                        <Text style={styles.label}>Last Name</Text>
                                        <TextInput
                                            style={[styles.input, isMobile && styles.inputMobile]}
                                            value={formData.lastName}
                                            onChangeText={(value) => handleInputChange('lastName', value)}
                                            placeholder="Enter your last name"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Organization (Optional)</Text>
                                    <TextInput
                                        style={[styles.input, isMobile && styles.inputMobile]}
                                        value={formData.organization}
                                        onChangeText={(value) => handleInputChange('organization', value)}
                                        placeholder="Your organization name"
                                    />
                                </View>
                            </>
                        )}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={[styles.input, isMobile && styles.inputMobile]}
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                placeholder="your.email@example.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={[styles.input, isMobile && styles.inputMobile]}
                                value={formData.password}
                                onChangeText={(value) => handleInputChange('password', value)}
                                placeholder="Enter your password"
                                secureTextEntry
                            />
                        </View>

                        {!isLogin && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <TextInput
                                    style={[styles.input, isMobile && styles.inputMobile]}
                                    value={formData.confirmPassword}
                                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                                    placeholder="Confirm your password"
                                    secureTextEntry
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Ionicons name={isLogin ? "log-in" : "person-add"} size={20} color="white" />
                            <Text style={styles.submitButtonText}>
                                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchText}>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                            </Text>
                            <TouchableOpacity onPress={switchMode}>
                                <Text style={styles.switchLink}>
                                    {isLogin ? 'Sign up' : 'Sign in'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {isLogin && (
                            <View style={styles.demoNote}>
                                <Ionicons name="information-circle" size={16} color="#2E7D32" />
                                <Text style={styles.demoNoteText}>
                                    Demo: Use any email and password to login
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    authContainer: {
        minHeight: '80vh',
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    authContainerMobile: {
        padding: 16,
        minHeight: '90vh',
    },
    authCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 32,
        width: '100%',
        maxWidth: 480,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    authCardMobile: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        padding: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    titleMobile: {
        fontSize: 24,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    subtitleMobile: {
        fontSize: 14,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee',
        borderColor: '#fcc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        gap: 8,
    },
    errorText: {
        color: '#c33',
        fontSize: 14,
        flex: 1,
    },
    form: {
        gap: 16,
    },
    nameRow: {
        flexDirection: 'row',
        gap: 12,
    },
    nameRowMobile: {
        flexDirection: 'column',
        gap: 16,
    },
    inputContainer: {
        gap: 6,
    },
    halfInput: {
        flex: 1,
    },
    halfInputMobile: {
        flex: 'none',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    inputMobile: {
        fontSize: 16,
        padding: 14,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        padding: 16,
        marginTop: 8,
        gap: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#a5d6a7',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    switchText: {
        color: '#666',
        fontSize: 14,
    },
    switchLink: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: '600',
    },
    demoNote: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
        borderColor: '#2E7D32',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
        gap: 8,
    },
    demoNoteText: {
        color: '#2E7D32',
        fontSize: 12,
        flex: 1,
    },
});