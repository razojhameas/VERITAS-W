import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

export default function WebFooter() {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    return (
        <View style={[styles.footer, isMobile && styles.footerMobile]}>
            <Text style={[styles.footerText, isMobile && styles.footerTextMobile]}>
                VERITAS Evidence Integrity System • Protecting Environmental Justice Through Blockchain Technology
            </Text>
            <Text style={[styles.footerSubtext, isMobile && styles.footerSubtextMobile]}>
                © 2024 VERITAS MVP • Project ID: veritas-c2a5c
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        backgroundColor: '#2E7D32',
        padding: 24,
        alignItems: 'center',
        marginTop: 40,
    },
    footerMobile: {
        padding: 20,
        marginTop: 32,
    },
    footerText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    footerTextMobile: {
        fontSize: 13,
        marginBottom: 6,
    },
    footerSubtext: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        textAlign: 'center',
    },
    footerSubtextMobile: {
        fontSize: 11,
    },
});