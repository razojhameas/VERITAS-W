import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CreditListingCard({ listing, user }) {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [isPurchasing, setIsPurchasing] = useState(false);

    const getEJISColor = (score) => {
        if (score >= 0.2) return '#d32f2f';
        if (score >= 0.15) return '#f57c00';
        if (score >= 0.1) return '#fbc02d';
        return '#2E7D32';
    };

    const handleBuyClick = () => {
        if (!user) {
            Alert.alert(
                'Login Required',
                'Please register or login to purchase C-CC credits',
                [{ text: 'OK' }]
            );
            return;
        }

        setIsPurchasing(true);

        setTimeout(() => {
            setIsPurchasing(false);
            Alert.alert(
                'Purchase Successful!',
                `You've successfully purchased 100 C-CC credits from ${listing.community}`,
                [{ text: 'Great!' }]
            );
        }, 2000);
    };

    return (
        <View style={[styles.card, isMobile && styles.cardMobile]}>
            <View style={styles.header}>
                <Text style={[styles.title, isMobile && styles.titleMobile]}>{listing.community}</Text>
                <View style={[styles.ejisBadge, { backgroundColor: getEJISColor(listing.ejisScore) }]}>
                    <Text style={styles.ejisText}>EJIS: {listing.ejisScore}</Text>
                </View>
            </View>

            <Text style={[styles.description, isMobile && styles.descriptionMobile]}>{listing.project}</Text>

            <View style={[styles.details, isMobile && styles.detailsMobile]}>
                <View style={styles.detailItem}>
                    <Ionicons name="leaf" size={16} color="#2E7D32" />
                    <Text style={styles.detailLabel}>Available Credits</Text>
                    <Text style={styles.detailValue}>{listing.availableCredits} C-CC</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="cash" size={16} color="#2E7D32" />
                    <Text style={styles.detailLabel}>Price per Credit</Text>
                    <Text style={styles.detailValue}>${listing.price}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="document-text" size={16} color="#2E7D32" />
                    <Text style={styles.detailLabel}>Evidence Records</Text>
                    <Text style={styles.detailValue}>{listing.evidenceCount}</Text>
                </View>
            </View>

            <View style={[styles.footer, isMobile && styles.footerMobile]}>
                <View style={styles.impact}>
                    <Ionicons name="earth" size={16} color="#2E7D32" />
                    <Text style={[styles.impactText, isMobile && styles.impactTextMobile]}>
                        {listing.impactStatement}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.buyButton,
                        isMobile && styles.buyButtonMobile,
                        (!user || isPurchasing) && styles.buyButtonDisabled
                    ]}
                    onPress={handleBuyClick}
                    disabled={!user || isPurchasing}
                >
                    <Ionicons name="cart" size={16} color="white" />
                    <Text style={styles.buyButtonText}>
                        {!user ? 'Login to Buy' :
                            isPurchasing ? 'Processing...' : 'Buy Now (Simulated)'}
                    </Text>
                </TouchableOpacity>
            </View>

            {user && (
                <View style={styles.userNote}>
                    <Ionicons name="information-circle" size={14} color="#2E7D32" />
                    <Text style={styles.userNoteText}>
                        Simulated purchase - 100 C-CC for ${(listing.price * 100).toFixed(2)}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        margin: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minWidth: 300,
        maxWidth: 400,
    },
    cardMobile: {
        minWidth: '100%',
        maxWidth: '100%',
        margin: 4,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        flex: 1,
        marginRight: 12,
    },
    titleMobile: {
        fontSize: 16,
    },
    ejisBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    ejisText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 20,
    },
    descriptionMobile: {
        fontSize: 13,
        lineHeight: 18,
    },
    details: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    detailsMobile: {
        padding: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerMobile: {
        flexDirection: 'column',
        gap: 12,
    },
    impact: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginRight: 12,
    },
    impactText: {
        fontSize: 13,
        color: '#2E7D32',
        fontStyle: 'italic',
        marginLeft: 8,
        flex: 1,
    },
    impactTextMobile: {
        fontSize: 12,
        marginLeft: 6,
    },
    buyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2E7D32',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
        minWidth: 140,
        gap: 8,
    },
    buyButtonMobile: {
        minWidth: '100%',
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    buyButtonDisabled: {
        backgroundColor: '#95a5a6',
    },
    buyButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    userNote: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f8e9',
        borderColor: '#2E7D32',
        borderWidth: 1,
        borderRadius: 6,
        padding: 8,
        marginTop: 12,
        gap: 6,
    },
    userNoteText: {
        color: '#2E7D32',
        fontSize: 11,
        fontStyle: 'italic',
        flex: 1,
    },
});