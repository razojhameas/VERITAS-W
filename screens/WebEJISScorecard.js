import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EJISMapComponent from '../components/EJISMapComponent';
import WebFooter from '../components/WebFooter';
import { calculateEJISScores, subscribeToEvidenceUpdates } from '../data/apiFirebase';

export default function WebEJISScorecard({ user }) {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRealEJISData();

        const unsubscribe = subscribeToEvidenceUpdates(() => {
            loadRealEJISData();
        });

        return () => unsubscribe();
    }, []);

    const loadRealEJISData = async () => {
        try {
            setLoading(true);
            const scores = await calculateEJISScores();
            setCommunities(scores);
        } catch (error) {
            console.error('Error loading EJIS data:', error);
            setCommunities(getSampleCommunities());
        } finally {
            setLoading(false);
        }
    };

    const getSampleCommunities = () => {
        return [
            {
                name: 'Marikina Watershed',
                ejisScore: 0.21,
                evidenceCount: 89,
                trend: 'increasing',
                primaryThreats: ['Deforestation', 'Illegal Logging', 'Soil Erosion'],
                location: { latitude: 14.6500, longitude: 121.1500 }
            },
            {
                name: 'Quezon City Center',
                ejisScore: 0.14,
                evidenceCount: 47,
                trend: 'stable',
                primaryThreats: ['Air Pollution', 'Urban Sprawl', 'Waste Management'],
                location: { latitude: 14.6760, longitude: 121.0437 }
            },
            {
                name: 'Aurora Province',
                ejisScore: 0.08,
                evidenceCount: 23,
                trend: 'decreasing',
                primaryThreats: ['Coastal Erosion', 'Overfishing', 'Coral Bleaching'],
                location: { latitude: 15.7501, longitude: 121.5000 }
            },
            {
                name: 'Laguna Lake Area',
                ejisScore: 0.12,
                evidenceCount: 34,
                trend: 'increasing',
                primaryThreats: ['Water Pollution', 'Aquaculture Waste', 'Sedimentation'],
                location: { latitude: 14.3000, longitude: 121.2000 }
            }
        ];
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'increasing': return <Ionicons name="trending-up" size={16} color="#e74c3c" />;
            case 'decreasing': return <Ionicons name="trending-down" size={16} color="#2E7D32" />;
            default: return <Ionicons name="remove" size={16} color="#666" />;
        }
    };

    const getThreatLevel = (score) => {
        if (score >= 0.2) return { level: 'CRITICAL', color: '#d32f2f' };
        if (score >= 0.15) return { level: 'HIGH', color: '#f57c00' };
        if (score >= 0.1) return { level: 'MEDIUM', color: '#fbc02d' };
        return { level: 'LOW', color: '#2E7D32' };
    };

    const calculateOverallEJIS = () => {
        if (communities.length === 0) return 0.14;
        const total = communities.reduce((sum, community) => sum + community.ejisScore, 0);
        return parseFloat((total / communities.length).toFixed(2));
    };

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.header, isMobile && styles.headerMobile]}>
                <Text style={[styles.title, isMobile && styles.titleMobile]}>EcoRisk Mapper</Text>
                <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
                    Real-time monitoring of environmental justice threats across Philippine communities
                    {user && ' - Personalized threat alerts enabled'}
                </Text>
                <View style={[styles.overallScore, isMobile && styles.overallScoreMobile]}>
                    <Text style={styles.overallScoreLabel}>Overall EJIS Score:</Text>
                    <Text style={[styles.overallScoreValue, { color: getThreatLevel(calculateOverallEJIS()).color }]}>
                        {calculateOverallEJIS()}
                    </Text>
                    <Text style={styles.overallScoreLevel}>
                        {getThreatLevel(calculateOverallEJIS()).level} THREAT LEVEL
                    </Text>
                </View>
            </View>

            <View style={[styles.mapContainer, isMobile && styles.mapContainerMobile]}>
                <EJISMapComponent ejisData={communities} loading={loading} />
            </View>

            <View style={[styles.communitiesSection, isMobile && styles.communitiesSectionMobile]}>
                <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                    Community Breakdown {loading && '(Loading...)'}
                </Text>
                {user && (
                    <Text style={[styles.userNote, isMobile && styles.userNoteMobile]}>
                        You are monitoring {communities.length} communities for environmental threats
                    </Text>
                )}
                <View style={[styles.communitiesGrid, isMobile && styles.communitiesGridMobile]}>
                    {communities.map((community, index) => {
                        const threatInfo = getThreatLevel(community.ejisScore);
                        return (
                            <View key={index} style={[styles.communityCard, isMobile && styles.communityCardMobile]}>
                                <View style={styles.communityHeader}>
                                    <Text style={[styles.communityName, isMobile && styles.communityNameMobile]}>{community.name}</Text>
                                    <View style={[styles.threatBadge, { backgroundColor: threatInfo.color }]}>
                                        <Text style={styles.threatLevel}>{threatInfo.level}</Text>
                                    </View>
                                </View>

                                <View style={styles.scoreRow}>
                                    <Text style={styles.scoreLabel}>EJIS Score:</Text>
                                    <Text style={styles.scoreValue}>{community.ejisScore}</Text>
                                    <View style={styles.trend}>
                                        {getTrendIcon(community.trend)}
                                        <Text style={styles.trendText}>{community.trend}</Text>
                                    </View>
                                </View>

                                <View style={styles.evidenceCount}>
                                    <Ionicons name="document-text" size={16} color="#666" />
                                    <Text style={styles.evidenceText}>{community.evidenceCount} Evidence Records</Text>
                                </View>

                                <View style={styles.threats}>
                                    <Text style={styles.threatsTitle}>Primary Threats:</Text>
                                    {community.primaryThreats.map((threat, idx) => (
                                        <Text key={idx} style={styles.threatItem}>• {threat}</Text>
                                    ))}
                                </View>

                                {user && threatInfo.level === 'CRITICAL' && (
                                    <View style={styles.alertBanner}>
                                        <Ionicons name="warning" size={16} color="#d32f2f" />
                                        <Text style={styles.alertText}>Immediate attention required</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {communities.length === 0 && !loading && (
                    <View style={styles.noData}>
                        <Text style={styles.noDataText}>No community data available</Text>
                        <Text style={styles.noDataSubtext}>Evidence records from mobile app will appear here</Text>
                    </View>
                )}
            </View>

            <View style={[styles.analysis, isMobile && styles.analysisMobile]}>
                <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>Regional Analysis</Text>
                <View style={[styles.analysisGrid, isMobile && styles.analysisGridMobile]}>
                    <View style={[styles.analysisCard, isMobile && styles.analysisCardMobile]}>
                        <Ionicons name="flame" size={32} color="#d32f2f" />
                        <Text style={[styles.analysisTitle, isMobile && styles.analysisTitleMobile]}>Critical Zone</Text>
                        <Text style={[styles.analysisText, isMobile && styles.analysisTextMobile]}>
                            {communities.filter(c => c.ejisScore >= 0.2).length} communities show severe environmental degradation
                            {user && ' - Consider immediate intervention'}
                        </Text>
                    </View>
                    <View style={[styles.analysisCard, isMobile && styles.analysisCardMobile]}>
                        <Ionicons name="warning" size={32} color="#f57c00" />
                        <Text style={[styles.analysisTitle, isMobile && styles.analysisTitleMobile]}>Watch List</Text>
                        <Text style={[styles.analysisText, isMobile && styles.analysisTextMobile]}>
                            {communities.filter(c => c.ejisScore >= 0.1 && c.ejisScore < 0.2).length} communities need monitoring
                            {user && ' - Monitor weekly updates'}
                        </Text>
                    </View>
                    <View style={[styles.analysisCard, isMobile && styles.analysisCardMobile]}>
                        <Ionicons name="checkmark-circle" size={32} color="#2E7D32" />
                        <Text style={[styles.analysisTitle, isMobile && styles.analysisTitleMobile]}>Stable Areas</Text>
                        <Text style={[styles.analysisText, isMobile && styles.analysisTextMobile]}>
                            {communities.filter(c => c.ejisScore < 0.1).length} communities show positive trends
                            {user && ' - Successful models for replication'}
                        </Text>
                    </View>
                </View>
            </View>

            <WebFooter />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#2E7D32',
        padding: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerMobile: {
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
    },
    titleMobile: {
        fontSize: 24,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 26,
    },
    subtitleMobile: {
        fontSize: 16,
        lineHeight: 22,
    },
    overallScore: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        gap: 12,
    },
    overallScoreMobile: {
        flexDirection: 'column',
        gap: 8,
    },
    overallScoreLabel: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    overallScoreValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    overallScoreLevel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    userNote: {
        fontSize: 14,
        color: '#2E7D32',
        textAlign: 'center',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    userNoteMobile: {
        fontSize: 13,
    },
    mapContainer: {
        margin: 24,
        marginTop: 0,
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        height: 500,
    },
    mapContainerMobile: {
        margin: 16,
        marginTop: 0,
        height: 400,
    },
    communitiesSection: {
        padding: 24,
    },
    communitiesSectionMobile: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 16,
        textAlign: 'center',
    },
    sectionTitleMobile: {
        fontSize: 20,
        marginBottom: 12,
    },
    communitiesGrid: {
        gap: 16,
    },
    communitiesGridMobile: {
        gap: 12,
    },
    communityCard: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        position: 'relative',
    },
    communityCardMobile: {
        padding: 20,
    },
    communityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    communityName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        flex: 1,
        marginRight: 12,
    },
    communityNameMobile: {
        fontSize: 18,
    },
    threatBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    threatLevel: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    scoreLabel: {
        fontSize: 16,
        color: '#666',
        marginRight: 8,
    },
    scoreValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginRight: 12,
    },
    trend: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    evidenceCount: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    evidenceText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    threats: {
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 16,
    },
    threatsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
    },
    threatItem: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        borderColor: '#d32f2f',
        borderWidth: 1,
        borderRadius: 6,
        padding: 8,
        marginTop: 12,
        gap: 8,
    },
    alertText: {
        color: '#d32f2f',
        fontSize: 12,
        fontWeight: '600',
    },
    noData: {
        alignItems: 'center',
        padding: 40,
    },
    noDataText: {
        fontSize: 16,
        color: '#999',
        marginBottom: 8,
    },
    noDataSubtext: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
    },
    analysis: {
        padding: 24,
        paddingTop: 0,
    },
    analysisMobile: {
        padding: 16,
        paddingTop: 0,
    },
    analysisGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    analysisGridMobile: {
        gap: 12,
    },
    analysisCard: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        flex: 1,
        minWidth: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    analysisCardMobile: {
        minWidth: '100%',
        padding: 20,
    },
    analysisTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginTop: 12,
        marginBottom: 8,
    },
    analysisTitleMobile: {
        fontSize: 16,
    },
    analysisText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    analysisTextMobile: {
        fontSize: 13,
    },
});