import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GoogleMap from './GoogleMap';
import MapContainer from './MapContainer';

const EJISMapComponent = ({ ejisData = [], loading = false }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const communities = ejisData.length > 0 ? ejisData : getSampleCommunities();

    const handleCommunitySelect = (community) => {
        setSelectedCommunity(community);
        setShowDetails(true);
    };

    const closeDetails = () => {
        setShowDetails(false);
        setSelectedCommunity(null);
    };

    const getThreatLevel = (score) => {
        if (score >= 0.2) return 'CRITICAL';
        if (score >= 0.15) return 'HIGH';
        if (score >= 0.1) return 'MEDIUM';
        return 'LOW';
    };

    const getThreatColor = (score) => {
        if (score >= 0.2) return '#d32f2f';
        if (score >= 0.15) return '#f57c00';
        if (score >= 0.1) return '#fbc02d';
        return '#2E7D32';
    };

    if (loading) {
        return (
            <MapContainer>
                <View style={[styles.loadingPlaceholder, isMobile && styles.loadingPlaceholderMobile]}>
                    <Ionicons name="refresh" size={32} color="#2E7D32" />
                    <Text style={[styles.loadingTitle, isMobile && styles.loadingTitleMobile]}>
                        Loading Real-time Data...
                    </Text>
                    <Text style={[styles.loadingSubtitle, isMobile && styles.loadingSubtitleMobile]}>
                        Connecting to VERITAS evidence database
                    </Text>
                </View>
            </MapContainer>
        );
    }

    return (
        <MapContainer>
            <GoogleMap
                communities={communities}
                onCommunitySelect={handleCommunitySelect}
            />

            {showDetails && selectedCommunity && (
                <View style={[styles.detailsPanel, isMobile && styles.detailsPanelMobile]}>
                    <View style={styles.detailsHeader}>
                        <Text style={[styles.detailsTitle, isMobile && styles.detailsTitleMobile]}>
                            {selectedCommunity.name}
                        </Text>
                        <TouchableOpacity onPress={closeDetails} style={styles.closeButton}>
                            <Ionicons name="close" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.detailsContent}>
                        <View style={styles.detailRow}>
                            <Ionicons name="analytics" size={16} color="#666" />
                            <Text style={styles.detailLabel}>EJIS Score:</Text>
                            <Text style={[styles.detailValue, { color: getThreatColor(selectedCommunity.ejisScore) }]}>
                                {selectedCommunity.ejisScore}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="document-text" size={16} color="#666" />
                            <Text style={styles.detailLabel}>Evidence Records:</Text>
                            <Text style={styles.detailValue}>{selectedCommunity.evidenceCount}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="warning" size={16} color="#666" />
                            <Text style={styles.detailLabel}>Threat Level:</Text>
                            <Text style={[styles.detailValue, { color: getThreatColor(selectedCommunity.ejisScore) }]}>
                                {getThreatLevel(selectedCommunity.ejisScore)}
                            </Text>
                        </View>

                        {selectedCommunity.primaryThreats && selectedCommunity.primaryThreats.length > 0 && (
                            <View style={styles.threatsSection}>
                                <Text style={styles.threatsTitle}>Primary Threats:</Text>
                                {selectedCommunity.primaryThreats.map((threat, index) => (
                                    <Text key={index} style={styles.threatItem}>• {threat}</Text>
                                ))}
                            </View>
                        )}

                        {selectedCommunity.location && (
                            <View style={styles.locationSection}>
                                <Text style={styles.locationTitle}>Coordinates:</Text>
                                <Text style={styles.locationText}>
                                    {selectedCommunity.location.latitude.toFixed(4)}, {selectedCommunity.location.longitude.toFixed(4)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {!showDetails && (
                <View style={[styles.instructions, isMobile && styles.instructionsMobile]}>
                    <Ionicons name="information-circle" size={16} color="#2E7D32" />
                    <Text style={styles.instructionsText}>
                        Click on map markers to view community details
                    </Text>
                </View>
            )}
        </MapContainer>
    );
};

const getSampleCommunities = () => {
    return [
        {
            name: 'Quezon City Center',
            ejisScore: 0.14,
            evidenceCount: 47,
            threatLevel: 'HIGH',
            primaryThreats: ['Air Pollution', 'Urban Sprawl', 'Waste Management'],
            location: { latitude: 14.6760, longitude: 121.0437 }
        },
        {
            name: 'Aurora Province',
            ejisScore: 0.08,
            evidenceCount: 23,
            threatLevel: 'LOW',
            primaryThreats: ['Coastal Erosion', 'Overfishing', 'Coral Bleaching'],
            location: { latitude: 15.7501, longitude: 121.5000 }
        },
        {
            name: 'Marikina Watershed',
            ejisScore: 0.21,
            evidenceCount: 89,
            threatLevel: 'CRITICAL',
            primaryThreats: ['Deforestation', 'Illegal Logging', 'Soil Erosion'],
            location: { latitude: 14.6500, longitude: 121.1500 }
        },
        {
            name: 'Laguna Lake Area',
            ejisScore: 0.12,
            evidenceCount: 34,
            threatLevel: 'MEDIUM',
            primaryThreats: ['Water Pollution', 'Aquaculture Waste', 'Sedimentation'],
            location: { latitude: 14.3000, longitude: 121.2000 }
        }
    ];
};

const styles = StyleSheet.create({
    loadingPlaceholder: {
        flex: 1,
        backgroundColor: '#e8f5e8',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        borderWidth: 2,
        borderColor: '#2E7D32',
        borderStyle: 'dashed',
        borderRadius: 12,
        height: '100%',
    },
    loadingPlaceholderMobile: {
        padding: 16,
    },
    loadingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    loadingTitleMobile: {
        fontSize: 18,
    },
    loadingSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    loadingSubtitleMobile: {
        fontSize: 13,
    },
    detailsPanel: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        maxWidth: 300,
        maxHeight: 400,
    },
    detailsPanelMobile: {
        top: 8,
        right: 8,
        left: 8,
        maxWidth: 'none',
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        flex: 1,
        marginRight: 12,
    },
    detailsTitleMobile: {
        fontSize: 16,
    },
    closeButton: {
        padding: 4,
    },
    detailsContent: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        marginRight: 'auto',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    threatsSection: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    threatsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    threatItem: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    locationSection: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    locationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
    instructions: {
        position: 'absolute',
        bottom: 60,
        left: 16,
        right: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 8,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    instructionsMobile: {
        bottom: 50,
    },
    instructionsText: {
        fontSize: 12,
        color: '#2E7D32',
        fontWeight: '500',
    },
});

export default EJISMapComponent;