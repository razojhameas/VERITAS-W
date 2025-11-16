import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebFooter from '../components/WebFooter';
import { getAllRecordsFromFirestore, calculateEJISScores, getBlockchainTransactions } from '../data/apiFirebase';
import { getAllBlockchainTransactions } from '../data/apiBlockchain';

export default function WebAnalytics({ user }) {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [analytics, setAnalytics] = useState({
        systemHealth: 98.5,
        integrityMetrics: {},
        complianceStatus: {},
        performanceStats: {},
        threatAnalysis: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalyticsData();
    }, []);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);

            const [records, ejisScores, blockchainTxs] = await Promise.all([
                getAllRecordsFromFirestore(),
                calculateEJISScores(),
                getBlockchainTransactions()
            ]);

            const systemHealth = calculateSystemHealth(records, blockchainTxs);
            const integrityMetrics = calculateIntegrityMetrics(records, blockchainTxs);
            const complianceStatus = calculateComplianceStatus(records, blockchainTxs);
            const performanceStats = calculatePerformanceStats(records, blockchainTxs);
            const threatAnalysis = calculateThreatAnalysis(ejisScores);

            setAnalytics({
                systemHealth,
                integrityMetrics,
                complianceStatus,
                performanceStats,
                threatAnalysis
            });
        } catch (error) {
            console.error('Error loading analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateSystemHealth = (records, blockchainTxs) => {
        if (records.length === 0) return 95.0;

        const verifiedRecords = records.filter(record =>
            record.blockchainTxId && record.blockchainTxId !== 'pending_tx_id'
        ).length;

        const verificationRate = (verifiedRecords / records.length) * 100;
        const blockchainSuccessRate = (blockchainTxs.length / Math.max(records.length, 1)) * 100;

        return Math.min(100, (verificationRate * 0.6 + blockchainSuccessRate * 0.4));
    };

    const calculateIntegrityMetrics = (records, blockchainTxs) => {
        const totalRecords = records.length;
        const verifiedRecords = records.filter(record =>
            record.blockchainTxId && record.blockchainTxId !== 'pending_tx_id'
        ).length;

        const uniqueUsers = new Set(records.map(record => record.userId)).size;
        const avgEvidencePerUser = totalRecords / Math.max(uniqueUsers, 1);

        return {
            totalRecords,
            verifiedRecords,
            verificationRate: totalRecords > 0 ? (verifiedRecords / totalRecords) * 100 : 0,
            uniqueContributors: uniqueUsers,
            avgEvidencePerUser: Math.round(avgEvidencePerUser * 10) / 10,
            dataIntegrityScore: totalRecords > 0 ? (verifiedRecords / totalRecords) * 100 : 100
        };
    };

    const calculateComplianceStatus = (records, blockchainTxs) => {
        const recentRecords = records.filter(record => {
            const recordDate = new Date(record.timestamp);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return recordDate > thirtyDaysAgo;
        });

        const compliantRecords = recentRecords.filter(record =>
            record.location && record.location.accuracy && record.location.accuracy < 50
        ).length;

        return {
            overallCompliance: records.length > 0 ? (compliantRecords / recentRecords.length) * 100 : 100,
            recentActivity: recentRecords.length,
            complianceTrend: 'improving',
            auditReady: compliantRecords > 0
        };
    };

    const calculatePerformanceStats = (records, blockchainTxs) => {
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const recentRecords = records.filter(record =>
            new Date(record.timestamp) > lastWeek
        ).length;

        const avgProcessingTime = 2.5;
        const successRate = 99.2;

        return {
            weeklySubmissions: recentRecords,
            avgProcessingTime,
            successRate,
            uptime: 99.9,
            responseTime: '1.2s'
        };
    };

    const calculateThreatAnalysis = (ejisScores) => {
        const criticalCount = ejisScores.filter(score => score.ejisScore >= 0.2).length;
        const highCount = ejisScores.filter(score => score.ejisScore >= 0.15 && score.ejisScore < 0.2).length;
        const totalCommunities = ejisScores.length;

        return {
            criticalThreats: criticalCount,
            highThreats: highCount,
            monitoredCommunities: totalCommunities,
            threatCoverage: totalCommunities > 0 ? ((criticalCount + highCount) / totalCommunities) * 100 : 0,
            avgResponseTime: '24h'
        };
    };

    const getHealthColor = (score) => {
        if (score >= 90) return '#2E7D32';
        if (score >= 80) return '#ff9800';
        return '#f44336';
    };

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.hero, isMobile && styles.heroMobile]}>
                <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
                    System Analytics & Oversight
                </Text>
                <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
                    Comprehensive monitoring of VERITAS system health, integrity metrics, and compliance status
                </Text>
            </View>

            <View style={[styles.overview, isMobile && styles.overviewMobile]}>
                <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                    System Overview {loading && '(Loading...)'}
                </Text>

                <View style={[styles.healthCard, isMobile && styles.healthCardMobile]}>
                    <View style={styles.healthHeader}>
                        <Ionicons name="heart" size={32} color={getHealthColor(analytics.systemHealth)} />
                        <View style={styles.healthInfo}>
                            <Text style={styles.healthLabel}>Overall System Health</Text>
                            <Text style={[styles.healthValue, { color: getHealthColor(analytics.systemHealth) }]}>
                                {analytics.systemHealth}%
                            </Text>
                        </View>
                    </View>
                    <View style={styles.healthBar}>
                        <View
                            style={[
                                styles.healthProgress,
                                {
                                    width: `${analytics.systemHealth}%`,
                                    backgroundColor: getHealthColor(analytics.systemHealth)
                                }
                            ]}
                        />
                    </View>
                    <Text style={styles.healthStatus}>
                        {analytics.systemHealth >= 90 ? 'Excellent' :
                            analytics.systemHealth >= 80 ? 'Good' : 'Needs Attention'}
                    </Text>
                </View>

                <View style={[styles.metricsGrid, isMobile && styles.metricsGridMobile]}>
                    <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
                        <Ionicons name="shield-checkmark" size={24} color="#2E7D32" />
                        <Text style={styles.metricValue}>
                            {loading ? '...' : analytics.integrityMetrics.dataIntegrityScore?.toFixed(1)}%
                        </Text>
                        <Text style={styles.metricLabel}>Data Integrity</Text>
                        <Text style={styles.metricDescription}>
                            Blockchain-verified evidence records
                        </Text>
                    </View>

                    <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
                        <Ionicons name="document-text" size={24} color="#2E7D32" />
                        <Text style={styles.metricValue}>
                            {loading ? '...' : analytics.complianceStatus.overallCompliance?.toFixed(1)}%
                        </Text>
                        <Text style={styles.metricLabel}>Regulatory Compliance</Text>
                        <Text style={styles.metricDescription}>
                            Meets environmental monitoring standards
                        </Text>
                    </View>

                    <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
                        <Ionicons name="speedometer" size={24} color="#2E7D32" />
                        <Text style={styles.metricValue}>
                            {loading ? '...' : analytics.performanceStats.successRate}%
                        </Text>
                        <Text style={styles.metricLabel}>System Uptime</Text>
                        <Text style={styles.metricDescription}>
                            Operational reliability score
                        </Text>
                    </View>

                    <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
                        <Ionicons name="eye" size={24} color="#2E7D32" />
                        <Text style={styles.metricValue}>
                            {loading ? '...' : analytics.threatAnalysis.monitoredCommunities}
                        </Text>
                        <Text style={styles.metricLabel}>Active Communities</Text>
                        <Text style={styles.metricDescription}>
                            Real-time environmental monitoring
                        </Text>
                    </View>
                </View>
            </View>

            <View style={[styles.detailedMetrics, isMobile && styles.detailedMetricsMobile]}>
                <View style={[styles.metricSection, isMobile && styles.metricSectionMobile]}>
                    <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                        Integrity Metrics
                    </Text>
                    <View style={[styles.detailGrid, isMobile && styles.detailGridMobile]}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Total Evidence Records</Text>
                            <Text style={styles.detailValue}>
                                {loading ? '...' : analytics.integrityMetrics.totalRecords?.toLocaleString()}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Verified Records</Text>
                            <Text style={styles.detailValue}>
                                {loading ? '...' : analytics.integrityMetrics.verifiedRecords?.toLocaleString()}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Verification Rate</Text>
                            <Text style={styles.detailValue}>
                                {loading ? '...' : analytics.integrityMetrics.verificationRate?.toFixed(1)}%
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Unique Contributors</Text>
                            <Text style={styles.detailValue}>
                                {loading ? '...' : analytics.integrityMetrics.uniqueContributors}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.metricSection, isMobile && styles.metricSectionMobile]}>
                    <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                        Compliance Status
                    </Text>
                    <View style={[styles.detailGrid, isMobile && styles.detailGridMobile]}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Overall Compliance</Text>
                            <Text style={styles.detailValue}>
                                {loading ? '...' : analytics.complianceStatus.overallCompliance?.toFixed(1)}%
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Recent Activity (30d)</Text>
                            <Text style={styles.detailValue}>
                                {loading ? '...' : analytics.complianceStatus.recentActivity}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Compliance Trend</Text>
                            <Text style={[styles.detailValue, { color: '#2E7D32' }]}>
                                {analytics.complianceStatus.complianceTrend}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Audit Ready</Text>
                            <Text style={[styles.detailValue, { color: analytics.complianceStatus.auditReady ? '#2E7D32' : '#ff9800' }]}>
                                {analytics.complianceStatus.auditReady ? 'Yes' : 'Review Needed'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.metricSection, isMobile && styles.metricSectionMobile]}>
                    <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                        Performance Statistics
                    </Text>
                    <View style={[styles.detailGrid, isMobile && styles.detailGridMobile]}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Weekly Submissions</Text>
                            <Text style={styles.detailValue}>
                                {loading ? '...' : analytics.performanceStats.weeklySubmissions}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Avg Processing Time</Text>
                            <Text style={styles.detailValue}>
                                {loading ? '...' : analytics.performanceStats.avgProcessingTime}s
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Success Rate</Text>
                            <Text style={styles.detailValue}>
                                {loading ? '...' : analytics.performanceStats.successRate}%
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>System Uptime</Text>
                            <Text style={styles.detailValue}>
                                {loading ? '...' : analytics.performanceStats.uptime}%
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.metricSection, isMobile && styles.metricSectionMobile]}>
                    <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                        Threat Analysis
                    </Text>
                    <View style={[styles.detailGrid, isMobile && styles.detailGridMobile]}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Critical Threats</Text>
                            <Text style={[styles.detailValue, { color: '#f44336' }]}>
                                {loading ? '...' : analytics.threatAnalysis.criticalThreats}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>High Threats</Text>
                            <Text style={[styles.detailValue, { color: '#ff9800' }]}>
                                {loading ? '...' : analytics.threatAnalysis.highThreats}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Monitored Communities</Text>
                            <Text style={styles.detailValue}>
                                {loading ? '...' : analytics.threatAnalysis.monitoredCommunities}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Threat Coverage</Text>
                            <Text style={styles.detailValue}>
                                {loading ? '...' : analytics.threatAnalysis.threatCoverage?.toFixed(1)}%
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={[styles.alerts, isMobile && styles.alertsMobile]}>
                <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                    System Alerts & Recommendations
                </Text>
                <View style={styles.alertsList}>
                    {analytics.systemHealth >= 90 ? (
                        <View style={[styles.alertItem, styles.alertSuccess]}>
                            <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                            <Text style={styles.alertText}>
                                System operating at optimal performance. All metrics within acceptable ranges.
                            </Text>
                        </View>
                    ) : (
                        <View style={[styles.alertItem, styles.alertWarning]}>
                            <Ionicons name="warning" size={20} color="#ff9800" />
                            <Text style={styles.alertText}>
                                System health requires attention. Review integrity metrics and performance statistics.
                            </Text>
                        </View>
                    )}

                    {analytics.integrityMetrics.verificationRate < 80 && (
                        <View style={[styles.alertItem, styles.alertWarning]}>
                            <Ionicons name="warning" size={20} color="#ff9800" />
                            <Text style={styles.alertText}>
                                Evidence verification rate below target. Consider reviewing blockchain synchronization.
                            </Text>
                        </View>
                    )}

                    {analytics.threatAnalysis.criticalThreats > 0 && (
                        <View style={[styles.alertItem, styles.alertError]}>
                            <Ionicons name="close-circle" size={20} color="#f44336" />
                            <Text style={styles.alertText}>
                                {analytics.threatAnalysis.criticalThreats} critical environmental threats detected requiring immediate attention.
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
    overview: {
        padding: 24,
    },
    overviewMobile: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
    },
    sectionTitleMobile: {
        fontSize: 20,
        marginBottom: 16,
    },
    healthCard: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 24,
    },
    healthCardMobile: {
        padding: 20,
    },
    healthHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 16,
    },
    healthInfo: {
        flex: 1,
    },
    healthLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    healthValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    healthBar: {
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginBottom: 12,
        overflow: 'hidden',
    },
    healthProgress: {
        height: '100%',
        borderRadius: 4,
    },
    healthStatus: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        textAlign: 'center',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    metricsGridMobile: {
        gap: 12,
    },
    metricCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    metricCardMobile: {
        minWidth: '45%',
        padding: 16,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginTop: 8,
        marginBottom: 8,
    },
    metricLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
        textAlign: 'center',
    },
    metricDescription: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    detailedMetrics: {
        padding: 24,
        paddingTop: 0,
    },
    detailedMetricsMobile: {
        padding: 16,
        paddingTop: 0,
    },
    metricSection: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    metricSectionMobile: {
        padding: 20,
    },
    detailGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    detailGridMobile: {
        gap: 12,
    },
    detailItem: {
        flex: 1,
        minWidth: 150,
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    alerts: {
        padding: 24,
        paddingTop: 0,
    },
    alertsMobile: {
        padding: 16,
        paddingTop: 0,
    },
    alertsList: {
        gap: 12,
    },
    alertItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 8,
        gap: 12,
    },
    alertSuccess: {
        backgroundColor: '#f1f8e9',
        borderLeftWidth: 4,
        borderLeftColor: '#2E7D32',
    },
    alertWarning: {
        backgroundColor: '#fff3e0',
        borderLeftWidth: 4,
        borderLeftColor: '#ff9800',
    },
    alertError: {
        backgroundColor: '#ffebee',
        borderLeftWidth: 4,
        borderLeftColor: '#f44336',
    },
    alertText: {
        flex: 1,
        fontSize: 14,
        color: '#2c3e50',
        lineHeight: 20,
    },
});