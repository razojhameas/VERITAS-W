import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebFooter from '../components/WebFooter';
import { getAllRecordsFromFirestore, calculateEJISScores, subscribeToEvidenceUpdates, getBlockchainTransactions } from '../data/apiFirebase';
import { getAllBlockchainTransactions } from '../data/apiBlockchain';

export default function WebOverviewScreen({ user, onTabChange }) {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [dashboardData, setDashboardData] = useState({
        totalRecords: 0,
        activeCommunities: 0,
        totalRevenue: 0,
        averageEJIS: 0,
        verifiedRecords: 0,
        pendingRecords: 0,
        systemHealth: 98.5,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        loadDashboardData();

        const unsubscribe = subscribeToEvidenceUpdates(() => {
            loadDashboardData();
        });

        return () => unsubscribe();
    }, [timeRange]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [records, ejisScores, blockchainTxs] = await Promise.all([
                getAllRecordsFromFirestore(),
                calculateEJISScores(),
                getBlockchainTransactions()
            ]);

            const totalRecords = records.length;
            const verifiedRecords = records.filter(record =>
                record.blockchainTxId && record.blockchainTxId !== 'pending_tx_id'
            ).length;
            const pendingRecords = totalRecords - verifiedRecords;

            const communities = new Set();
            records.forEach(record => {
                if (record.location) {
                    const regionKey = `${record.location.latitude.toFixed(1)},${record.location.longitude.toFixed(1)}`;
                    communities.add(regionKey);
                }
            });

            const totalRevenue = records.length * 12.5;

            const totalEJIS = ejisScores.reduce((sum, score) => sum + score.ejisScore, 0);
            const averageEJIS = ejisScores.length > 0 ? totalEJIS / ejisScores.length : 0.14;

            const verificationRate = totalRecords > 0 ? (verifiedRecords / totalRecords) * 100 : 100;
            const blockchainSuccessRate = (blockchainTxs.length / Math.max(records.length, 1)) * 100;
            const systemHealth = Math.min(100, (verificationRate * 0.6 + blockchainSuccessRate * 0.4));

            const recentActivity = records
                .slice(0, 10)
                .map(record => ({
                    id: record.id,
                    type: record.type || 'Evidence',
                    timestamp: record.timestamp,
                    community: getCommunityName(record.location),
                    status: record.blockchainTxId && record.blockchainTxId !== 'pending_tx_id' ? 'verified' : 'pending'
                }));

            setDashboardData({
                totalRecords,
                activeCommunities: communities.size,
                totalRevenue,
                averageEJIS: parseFloat(averageEJIS.toFixed(2)),
                verifiedRecords,
                pendingRecords,
                systemHealth: parseFloat(systemHealth.toFixed(1)),
                recentActivity
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCommunityName = (location) => {
        if (!location) return 'Unknown';

        const regions = {
            '14.7,121.0': 'Quezon City',
            '15.8,121.5': 'Aurora Province',
            '14.7,121.2': 'Marikina Watershed',
            '14.3,121.2': 'Laguna Lake'
        };

        const key = `${location.latitude.toFixed(1)},${location.longitude.toFixed(1)}`;
        return regions[key] || `Region ${key}`;
    };

    const getHealthColor = (score) => {
        if (score >= 90) return '#2E7D32';
        if (score >= 80) return '#ff9800';
        return '#f44336';
    };

    const getHealthStatus = (score) => {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Good';
        return 'Needs Attention';
    };

    const mainStats = [
        {
            label: 'Total Evidence Records',
            value: dashboardData.totalRecords.toLocaleString(),
            color: '#2E7D32',
            icon: 'document-text',
            trend: '+12%',
            description: 'All-time collected evidence'
        },
        {
            label: 'Active Communities',
            value: dashboardData.activeCommunities.toString(),
            color: '#2E7D32',
            icon: 'people',
            trend: '+3',
            description: 'Monitored regions'
        },
        {
            label: 'C-CC Revenue Generated',
            value: `$${dashboardData.totalRevenue.toLocaleString()}`,
            color: '#2E7D32',
            icon: 'cash',
            trend: '+8%',
            description: 'Total carbon credit value'
        },
        {
            label: 'Average EJIS Score',
            value: dashboardData.averageEJIS.toString(),
            color: '#e74c3c',
            icon: 'trending-up',
            trend: '-0.02',
            description: 'Environmental threat level'
        },
    ];

    const secondaryStats = [
        {
            label: 'System Health',
            value: `${dashboardData.systemHealth}%`,
            color: getHealthColor(dashboardData.systemHealth),
            icon: 'heart',
            status: getHealthStatus(dashboardData.systemHealth)
        },
        {
            label: 'Verified Records',
            value: dashboardData.verifiedRecords.toLocaleString(),
            color: '#2E7D32',
            icon: 'checkmark-circle',
            percentage: dashboardData.totalRecords > 0 ?
                Math.round((dashboardData.verifiedRecords / dashboardData.totalRecords) * 100) : 0
        },
        {
            label: 'Pending Verification',
            value: dashboardData.pendingRecords.toLocaleString(),
            color: '#ff9800',
            icon: 'time',
            percentage: dashboardData.totalRecords > 0 ?
                Math.round((dashboardData.pendingRecords / dashboardData.totalRecords) * 100) : 0
        }
    ];

    const quickActions = [
        {
            title: 'EcoRisk Mapper',
            description: 'Interactive threat visualization',
            icon: 'map',
            color: '#2E7D32',
            onPress: () => onTabChange('ejis')
        },
        {
            title: 'EcoImpact Ledger',
            description: 'Track all evidence submissions',
            icon: 'list',
            color: '#2E7D32',
            onPress: () => onTabChange('ledger')
        },
        {
            title: 'EcoCredit Hub',
            description: 'Trade carbon credits',
            icon: 'business',
            color: '#2E7D32',
            onPress: () => onTabChange('market')
        },
        {
            title: 'System Analytics',
            description: 'Performance & compliance',
            icon: 'stats-chart',
            color: '#2E7D32',
            onPress: () => onTabChange('analytics')
        }
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.hero, isMobile && styles.heroMobile]}>
                <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
                    {user ? `Welcome back, ${user.firstName}!` : 'VERITAS Dashboard'}
                </Text>
                <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
                    {user
                        ? 'Real-time overview of environmental justice monitoring system'
                        : 'Environmental Justice Integrity System - Blockchain-Verified Evidence Collection'
                    }
                </Text>
                {!user && (
                    <Text style={[styles.heroNote, isMobile && styles.heroNoteMobile]}>
                        Register to access advanced features and personalized insights
                    </Text>
                )}
            </View>

            {user && (
                <View style={[styles.userWelcome, isMobile && styles.userWelcomeMobile]}>
                    <View style={styles.userHeader}>
                        <View style={styles.userInfo}>
                            <Text style={[styles.welcomeTitle, isMobile && styles.welcomeTitleMobile]}>
                                Your Environmental Impact
                            </Text>
                            <Text style={[styles.welcomeSubtitle, isMobile && styles.welcomeSubtitleMobile]}>
                                Member since {new Date(user.joinDate).toLocaleDateString()} • Last active today
                            </Text>
                        </View>
                        <View style={[styles.timeFilter, isMobile && styles.timeFilterMobile]}>
                            {['7d', '30d', '90d'].map(range => (
                                <TouchableOpacity
                                    key={range}
                                    style={[
                                        styles.timeFilterButton,
                                        timeRange === range && styles.timeFilterButtonActive
                                    ]}
                                    onPress={() => setTimeRange(range)}
                                >
                                    <Text style={[
                                        styles.timeFilterText,
                                        timeRange === range && styles.timeFilterTextActive
                                    ]}>
                                        {range}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            <View style={[styles.mainStatsSection, isMobile && styles.mainStatsSectionMobile]}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                        Key Metrics {loading && '(Loading...)'}
                    </Text>
                    <Text style={[styles.sectionSubtitle, isMobile && styles.sectionSubtitleMobile]}>
                        Real-time system performance and environmental impact
                    </Text>
                </View>

                <View style={[styles.mainStatsGrid, isMobile && styles.mainStatsGridMobile]}>
                    {mainStats.map((stat, index) => (
                        <View key={index} style={[styles.mainStatCard, isMobile && styles.mainStatCardMobile]}>
                            <View style={styles.statHeader}>
                                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                                    <Ionicons name={stat.icon} size={24} color={stat.color} />
                                </View>
                                <Text style={[styles.trend, { color: stat.trend.startsWith('+') ? '#2E7D32' : '#e74c3c' }]}>
                                    {stat.trend}
                                </Text>
                            </View>
                            {loading ? (
                                <Text style={[styles.loadingText, { color: stat.color }]}>Loading...</Text>
                            ) : (
                                <Text style={[styles.mainStatValue, { color: stat.color }]}>
                                    {stat.value}
                                </Text>
                            )}
                            <Text style={styles.mainStatLabel}>{stat.label}</Text>
                            <Text style={styles.statDescription}>{stat.description}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={[styles.secondarySection, isMobile && styles.secondarySectionMobile]}>
                <View style={[styles.secondaryStats, isMobile && styles.secondaryStatsMobile]}>
                    <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                        System Status
                    </Text>
                    <View style={[styles.secondaryStatsGrid, isMobile && styles.secondaryStatsGridMobile]}>
                        {secondaryStats.map((stat, index) => (
                            <View key={index} style={[styles.secondaryStatCard, isMobile && styles.secondaryStatCardMobile]}>
                                <View style={styles.secondaryStatHeader}>
                                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                                    <Text style={[styles.secondaryStatLabel, isMobile && styles.secondaryStatLabelMobile]}>
                                        {stat.label}
                                    </Text>
                                </View>
                                {loading ? (
                                    <Text style={[styles.loadingText, { color: stat.color }]}>...</Text>
                                ) : (
                                    <Text style={[styles.secondaryStatValue, { color: stat.color }]}>
                                        {stat.value}
                                    </Text>
                                )}
                                {stat.status && (
                                    <Text style={[styles.statusText, { color: stat.color }]}>
                                        {stat.status}
                                    </Text>
                                )}
                                {stat.percentage !== undefined && (
                                    <View style={styles.percentageBar}>
                                        <View
                                            style={[
                                                styles.percentageFill,
                                                {
                                                    width: `${stat.percentage}%`,
                                                    backgroundColor: stat.color
                                                }
                                            ]}
                                        />
                                        <Text style={styles.percentageText}>{stat.percentage}%</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                <View style={[styles.quickActions, isMobile && styles.quickActionsMobile]}>
                    <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                        Quick Actions
                    </Text>
                    <View style={[styles.quickActionsGrid, isMobile && styles.quickActionsGridMobile]}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.quickActionCard, isMobile && styles.quickActionCardMobile]}
                                onPress={action.onPress}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                                    <Ionicons name={action.icon} size={24} color={action.color} />
                                </View>
                                <Text style={[styles.actionTitle, isMobile && styles.actionTitleMobile]}>
                                    {action.title}
                                </Text>
                                <Text style={[styles.actionDescription, isMobile && styles.actionDescriptionMobile]}>
                                    {action.description}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <View style={[styles.recentActivity, isMobile && styles.recentActivityMobile]}>
                <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                    Recent Activity
                </Text>
                <View style={[styles.activityList, isMobile && styles.activityListMobile]}>
                    {dashboardData.recentActivity.length > 0 ? (
                        dashboardData.recentActivity.map((activity, index) => (
                            <View key={index} style={[styles.activityItem, isMobile && styles.activityItemMobile]}>
                                <View style={styles.activityIcon}>
                                    <Ionicons
                                        name={activity.status === 'verified' ? 'checkmark-circle' : 'time'}
                                        size={16}
                                        color={activity.status === 'verified' ? '#2E7D32' : '#ff9800'}
                                    />
                                </View>
                                <View style={styles.activityInfo}>
                                    <Text style={[styles.activityTitle, isMobile && styles.activityTitleMobile]}>
                                        {activity.type} Record
                                    </Text>
                                    <Text style={[styles.activitySubtitle, isMobile && styles.activitySubtitleMobile]}>
                                        {activity.community} • {new Date(activity.timestamp).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: activity.status === 'verified' ? '#2E7D32' : '#ff9800' }
                                ]}>
                                    <Text style={styles.statusText}>
                                        {activity.status === 'verified' ? 'Verified' : 'Pending'}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.noActivity}>
                            <Ionicons name="document-text" size={32} color="#ccc" />
                            <Text style={styles.noActivityText}>No recent activity</Text>
                            <Text style={styles.noActivitySubtext}>
                                Evidence submissions will appear here
                            </Text>
                        </View>
                    )}
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
    hero: {
        backgroundColor: '#2E7D32',
        padding: 48,
        alignItems: 'center',
    },
    heroMobile: {
        padding: 24,
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
        textAlign: 'center',
    },
    heroTitleMobile: {
        fontSize: 28,
    },
    heroSubtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 28,
        maxWidth: 600,
    },
    heroSubtitleMobile: {
        fontSize: 16,
        lineHeight: 24,
    },
    heroNote: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },
    heroNoteMobile: {
        fontSize: 13,
    },
    userWelcome: {
        backgroundColor: 'white',
        padding: 24,
        margin: 24,
        marginTop: 0,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    userWelcomeMobile: {
        margin: 16,
        marginTop: 0,
        padding: 20,
    },
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
    },
    welcomeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    welcomeTitleMobile: {
        fontSize: 18,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    welcomeSubtitleMobile: {
        fontSize: 13,
    },
    timeFilter: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 4,
    },
    timeFilterMobile: {
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    timeFilterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    timeFilterButtonActive: {
        backgroundColor: '#2E7D32',
    },
    timeFilterText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    timeFilterTextActive: {
        color: 'white',
    },
    mainStatsSection: {
        padding: 24,
    },
    mainStatsSectionMobile: {
        padding: 16,
    },
    sectionHeader: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    sectionTitleMobile: {
        fontSize: 20,
    },
    sectionSubtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    sectionSubtitleMobile: {
        fontSize: 14,
    },
    mainStatsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    mainStatsGridMobile: {
        gap: 12,
    },
    mainStatCard: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        flex: 1,
        minWidth: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    mainStatCardMobile: {
        minWidth: '100%',
        padding: 20,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trend: {
        fontSize: 14,
        fontWeight: '600',
    },
    mainStatValue: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    mainStatLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    statDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    secondarySection: {
        padding: 24,
        paddingTop: 0,
        flexDirection: 'row',
        gap: 24,
    },
    secondarySectionMobile: {
        padding: 16,
        paddingTop: 0,
        flexDirection: 'column',
        gap: 16,
    },
    secondaryStats: {
        flex: 2,
    },
    secondaryStatsMobile: {
        flex: 1,
    },
    secondaryStatsGrid: {
        gap: 16,
    },
    secondaryStatsGridMobile: {
        gap: 12,
    },
    secondaryStatCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    secondaryStatCardMobile: {
        padding: 16,
    },
    secondaryStatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    secondaryStatLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
    },
    secondaryStatLabelMobile: {
        fontSize: 13,
    },
    secondaryStatValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    percentageBar: {
        height: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 3,
        marginTop: 8,
        position: 'relative',
    },
    percentageFill: {
        height: '100%',
        borderRadius: 3,
        transition: 'width 0.3s ease',
    },
    percentageText: {
        position: 'absolute',
        right: 0,
        top: -20,
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
    },
    quickActions: {
        flex: 1,
    },
    quickActionsMobile: {
        flex: 1,
    },
    quickActionsGrid: {
        gap: 16,
    },
    quickActionsGridMobile: {
        gap: 12,
    },
    quickActionCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    quickActionCardMobile: {
        padding: 16,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    actionTitleMobile: {
        fontSize: 15,
    },
    actionDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    actionDescriptionMobile: {
        fontSize: 13,
    },
    recentActivity: {
        padding: 24,
        paddingTop: 0,
    },
    recentActivityMobile: {
        padding: 16,
        paddingTop: 0,
    },
    activityList: {
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        overflow: 'hidden',
    },
    activityListMobile: {
        borderRadius: 8,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    activityItemMobile: {
        padding: 12,
    },
    activityIcon: {
        marginRight: 12,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 2,
    },
    activityTitleMobile: {
        fontSize: 13,
    },
    activitySubtitle: {
        fontSize: 12,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
    noActivity: {
        alignItems: 'center',
        padding: 40,
    },
    noActivityText: {
        fontSize: 16,
        color: '#999',
        marginTop: 12,
        marginBottom: 4,
    },
    noActivitySubtext: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
    },
});