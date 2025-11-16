import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WebHeader({ activeTab, onTabChange, user, onLoginClick, onLogout }) {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'home' },
        { id: 'ejis', label: 'EcoRisk Mapper', icon: 'map' },
        { id: 'market', label: 'EcoCredit Hub', icon: 'card' },
        { id: 'ledger', label: 'EcoImpact Ledger', icon: 'list' },
        { id: 'verification', label: 'EcoChain Verify', icon: 'search' },
        { id: 'analytics', label: 'Analytics', icon: 'stats-chart' },
    ];

    const handleLoginPress = () => {
        onLoginClick();
    };

    const handleLogoutPress = () => {
        onLogout();
    };

    return (
        <View style={[styles.header, isMobile && styles.headerMobile]}>
            <View style={styles.logoContainer}>
                <View style={styles.logoRow}>
                    <Image
                        source={require('../assets/greenIcon.png')}
                        style={[styles.logoImage, isMobile && styles.logoImageMobile]}
                        resizeMode="contain"
                    />
                    <Text style={[styles.logo, isMobile && styles.logoMobile]}>VERITAS</Text>
                </View>
                <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>Evidence Integrity System</Text>
            </View>

            {!isMobile ? (
                <View style={[styles.nav, isMobile && styles.navMobile]}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.navItem,
                                activeTab === tab.id && styles.navItemActive,
                                isMobile && styles.navItemMobile
                            ]}
                            onPress={() => onTabChange(tab.id)}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={16}
                                color={activeTab === tab.id ? 'white' : '#666'}
                            />
                            <Text style={[
                                styles.navText,
                                activeTab === tab.id && styles.navTextActive,
                                isMobile && styles.navTextMobile
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <View style={styles.mobileNavContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mobileNavScroll}>
                        <View style={styles.mobileNav}>
                            {tabs.map(tab => (
                                <TouchableOpacity
                                    key={tab.id}
                                    style={[
                                        styles.navItem,
                                        activeTab === tab.id && styles.navItemActive,
                                        styles.navItemMobile
                                    ]}
                                    onPress={() => onTabChange(tab.id)}
                                >
                                    <Ionicons
                                        name={tab.icon}
                                        size={14}
                                        color={activeTab === tab.id ? 'white' : '#666'}
                                    />
                                    <Text style={[
                                        styles.navText,
                                        activeTab === tab.id && styles.navTextActive,
                                        styles.navTextMobile
                                    ]}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            )}

            <View style={[styles.authSection, isMobile && styles.authSectionMobile]}>
                {user ? (
                    <View style={[styles.userInfo, isMobile && styles.userInfoMobile]}>
                        {!isMobile && (
                            <View style={[styles.userDetails, isMobile && styles.userDetailsMobile]}>
                                <Text style={[styles.userName, isMobile && styles.userNameMobile]}>
                                    {user.firstName} {user.lastName}
                                </Text>
                                <Text style={[styles.userOrg, isMobile && styles.userOrgMobile]}>
                                    {user.organization}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={[styles.logoutButton, isMobile && styles.logoutButtonMobile]}
                            onPress={handleLogoutPress}
                        >
                            <Ionicons name="log-out" size={14} color="white" />
                            {!isMobile && <Text style={[styles.logoutText, isMobile && styles.logoutTextMobile]}>Logout</Text>}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.loginButton, isMobile && styles.loginButtonMobile]}
                        onPress={handleLoginPress}
                    >
                        <Ionicons name="log-in" size={16} color="white" />
                        <Text style={[styles.loginText, isMobile && styles.loginTextMobile]}>
                            {isMobile ? 'Login' : 'Login / Register'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    headerMobile: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'column',
        gap: 12,
    },
    logoContainer: {
        flexDirection: 'column',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoImage: {
        width: 32,
        height: 32,
    },
    logoImageMobile: {
        width: 28,
        height: 28,
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    logoMobile: {
        fontSize: 20,
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    subtitleMobile: {
        fontSize: 11,
    },
    nav: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    navMobile: {
        flex: 0,
        width: '100%',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    mobileNavContainer: {
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
    },
    mobileNavScroll: {
        width: '100%',
    },
    mobileNav: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 6,
        gap: 6,
        minWidth: 60,
    },
    navItemMobile: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginHorizontal: 3,
    },
    navItemActive: {
        backgroundColor: '#2E7D32',
    },
    navText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    navTextMobile: {
        fontSize: 12,
    },
    navTextActive: {
        color: 'white',
    },
    authSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authSectionMobile: {
        width: '100%',
        justifyContent: 'center',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    userInfoMobile: {
        flexDirection: 'column',
        gap: 8,
        width: '100%',
    },
    userDetails: {
        alignItems: 'flex-end',
    },
    userDetailsMobile: {
        alignItems: 'center',
        width: '100%',
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
    },
    userNameMobile: {
        fontSize: 14,
        textAlign: 'center',
    },
    userOrg: {
        fontSize: 12,
        color: '#666',
    },
    userOrgMobile: {
        fontSize: 11,
        textAlign: 'center',
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2E7D32',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
        gap: 8,
    },
    loginButtonMobile: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'center',
    },
    loginText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    loginTextMobile: {
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e74c3c',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 6,
    },
    logoutButtonMobile: {
        width: '100%',
        paddingVertical: 10,
        justifyContent: 'center',
    },
    logoutText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    logoutTextMobile: {
        fontSize: 14,
    },
});