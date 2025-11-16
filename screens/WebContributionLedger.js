import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebFooter from '../components/WebFooter';
import { getAllRecordsFromFirestore, getRecordsByUser } from '../data/apiFirebase';
import { getAllBlockchainTransactions } from '../data/apiBlockchain';

export default function WebContributionLedger({ user }) {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [contributions, setContributions] = useState([]);
    const [blockchainData, setBlockchainData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadContributionData();
    }, [user]);

    const loadContributionData = async () => {
        try {
            setLoading(true);

            const records = user ? await getRecordsByUser(user.id) : await getAllRecordsFromFirestore();

            const blockchainTxs = await getAllBlockchainTransactions();
            setBlockchainData(blockchainTxs);

            const combinedData = records.map(record => {
                const blockchainTx = blockchainTxs.find(tx => tx.hash === record.sha256Hash);
                return {
                    ...record,
                    blockchainTxId: blockchainTx?.txId || record.blockchainTxId,
                    blockNumber: blockchainTx?.blockNumber,
                    reputationScore: calculateReputationScore(record, blockchainTx)
                };
            });

            setContributions(combinedData);
        } catch (error) {
            console.error('Error loading contribution data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateReputationScore = (record, blockchainTx) => {
        let score = 50;

        if (record.location?.accuracy && record.location.accuracy < 10) score += 10;
        if (record.type === 'video') score += 15;
        if (record.type === 'photo') score += 10;
        if (blockchainTx) score += 25;

        return Math.min(100, score);
    };

    const filteredContributions = contributions.filter(contribution => {
        if (filter === 'all') return true;
        if (filter === 'verified') return contribution.blockchainTxId && contribution.blockchainTxId !== 'pending_tx_id';
        if (filter === 'pending') return !contribution.blockchainTxId || contribution.blockchainTxId === 'pending_tx_id';
        return true;
    });

    const getUserStats = () => {
        const userContributions = contributions.filter(c => c.userId === user?.id);
        const verifiedCount = userContributions.filter(c => c.blockchainTxId && c.blockchainTxId !== 'pending_tx_id').length;
        const totalReputation = userContributions.reduce((sum, c) => sum + c.reputationScore, 0);
        const averageReputation = userContributions.length > 0 ? Math.round(totalReputation / userContributions.length) : 0;

        return {
            totalContributions: userContributions.length,
            verifiedContributions: verifiedCount,
            averageReputation,
            verificationRate: userContributions.length > 0 ? Math.round((verifiedCount / userContributions.length) * 100) : 0
        };
    };

    const userStats = getUserStats();

    const getStatusBadge = (contribution) => {
        if (contribution.blockchainTxId && contribution.blockchainTxId !== 'pending_tx_id') {
            return { text: 'Verified', color: '#2E7D32', icon: 'checkmark-circle' };
        }
        return { text: 'Pending', color: '#ff9800', icon: 'time' };
    };

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.hero, isMobile && styles.heroMobile]}>
                <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
                    EcoImpact Ledger
                </Text>
                <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
                    Transparent, immutable record of all community environmental evidence contributions
                    {user && ` - Your Reputation Score: ${userStats.averageReputation}/100`}
                </Text>
            </View>

            {user && (
                <View style={[styles.userStats, isMobile && styles.userStatsMobile]}>
                    <Text style={[styles.userStatsTitle, isMobile && styles.userStatsTitleMobile]}>
                        Your Contribution Profile
                    </Text>
                    <View style={[styles.statsGrid, isMobile && styles.statsGridMobile]}>
                        <View style={styles.statCard}>
                            <Ionicons name="document-text" size={24} color="#2E7D32" />
                            <Text style={[styles.statValue, { color: '#2E7D32' }]}>
                                {userStats.totalContributions}
                            </Text>
                            <Text style={styles.statLabel}>Total Contributions</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                            <Text style={[styles.statValue, { color: '#2E7D32' }]}>
                                {userStats.verifiedContributions}
                            </Text>
                            <Text style={styles.statLabel}>Verified</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="star" size={24} color="#ff9800" />
                            <Text style={[styles.statValue, { color: '#ff9800' }]}>
                                {userStats.averageReputation}
                            </Text>
                            <Text style={styles.statLabel}>Reputation Score</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="trending-up" size={24} color="#9c27b0" />
                            <Text style={[styles.statValue, { color: '#9c27b0' }]}>
                                {userStats.verificationRate}%
                            </Text>
                            <Text style={styles.statLabel}>Verification Rate</Text>
                        </View>
                    </View>
                </View>
            )}

            <View style={[styles.ledgerSection, isMobile && styles.ledgerSectionMobile]}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                        All Community Contributions {loading && '(Loading...)'}
                    </Text>
                    <View style={[styles.filters, isMobile && styles.filtersMobile]}>
                        {['all', 'verified', 'pending'].map(filterType => (
                            <TouchableOpacity
                                key={filterType}
                                style={[
                                    styles.filterButton,
                                    filter === filterType && styles.filterButtonActive
                                ]}
                                onPress={() => setFilter(filterType)}
                            >
                                <Ionicons
                                    name={
                                        filterType === 'all' ? 'list' :
                                            filterType === 'verified' ? 'checkmark-circle' : 'time'
                                    }
                                    size={16}
                                    color={filter === filterType ? 'white' : '#666'}
                                />
                                <Text style={[
                                    styles.filterText,
                                    filter === filterType && styles.filterTextActive
                                ]}>
                                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={[styles.contributionsList, isMobile && styles.contributionsListMobile]}>
                    {filteredContributions.map((contribution, index) => {
                        const status = getStatusBadge(contribution);
                        return (
                            <View key={index} style={[styles.contributionCard, isMobile && styles.contributionCardMobile]}>
                                <View style={styles.contributionHeader}>
                                    <View style={styles.contributionInfo}>
                                        <Text style={[styles.contributionTitle, isMobile && styles.contributionTitleMobile]}>
                                            {contribution.fileName || 'Environmental Evidence'}
                                        </Text>
                                        <Text style={[styles.contributionType, isMobile && styles.contributionTypeMobile]}>
                                            {contribution.type || 'Evidence'} • {new Date(contribution.timestamp).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                                        <Ionicons name={status.icon} size={12} color="white" />
                                        <Text style={styles.statusText}>{status.text}</Text>
                                    </View>
                                </View>

                                <View style={styles.contributionDetails}>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="person" size={14} color="#666" />
                                        <Text style={styles.detailLabel}>Contributor:</Text>
                                        <Text style={styles.detailValue}>
                                            {contribution.userId === user?.id ? 'You' : `User ${contribution.userId?.substring(0, 8)}`}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="location" size={14} color="#666" />
                                        <Text style={styles.detailLabel}>Location:</Text>
                                        <Text style={styles.detailValue}>
                                            {contribution.location ?
                                                `${contribution.location.latitude.toFixed(4)}, ${contribution.location.longitude.toFixed(4)}` :
                                                'Unknown'
                                            }
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="star" size={14} color="#666" />
                                        <Text style={styles.detailLabel}>Reputation Score:</Text>
                                        <Text style={[styles.detailValue, { color: '#ff9800' }]}>
                                            {contribution.reputationScore}/100
                                        </Text>
                                    </View>
                                    {contribution.blockchainTxId && contribution.blockchainTxId !== 'pending_tx_id' && (
                                        <View style={styles.detailRow}>
                                            <Ionicons name="link" size={14} color="#666" />
                                            <Text style={styles.detailLabel}>Blockchain Tx:</Text>
                                            <Text style={[styles.detailValue, { color: '#2E7D32' }]}>
                                                {contribution.blockchainTxId.substring(0, 16)}...
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {contribution.blockchainTxId && contribution.blockchainTxId !== 'pending_tx_id' && (
                                    <View style={styles.blockchainInfo}>
                                        <Ionicons name="checkmark-done" size={14} color="#2E7D32" />
                                        <Text style={styles.blockchainText}>
                                            Immutably recorded on VERITAS Blockchain • Block #{contribution.blockNumber}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {filteredContributions.length === 0 && !loading && (
                    <View style={styles.noData}>
                        <Ionicons name="document-text" size={32} color="#999" />
                        <Text style={styles.noDataText}>No contributions found</Text>
                        <Text style={styles.noDataSubtext}>
                            {filter !== 'all' ? 'Try changing the filter' : 'Evidence contributions will appear here when submitted from mobile app'}
                        </Text>
                    </View>
                )}
            </View>

            <View style={[styles.aboutSection, isMobile && styles.aboutSectionMobile]}>
                <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                    About the EcoImpact Ledger
                </Text>
                <View style={[styles.aboutGrid, isMobile && styles.aboutGridMobile]}>
                    <View style={[styles.aboutCard, isMobile && styles.aboutCardMobile]}>
                        <Ionicons name="link" size={32} color="#2E7D32" />
                        <Text style={[styles.aboutTitle, isMobile && styles.aboutTitleMobile]}>Immutable Records</Text>
                        <Text style={[styles.aboutDescription, isMobile && styles.aboutDescriptionMobile]}>
                            Every contribution is cryptographically hashed and recorded on the blockchain for permanent verification
                        </Text>
                    </View>
                    <View style={[styles.aboutCard, isMobile && styles.aboutCardMobile]}>
                        <Ionicons name="star" size={32} color="#2E7D32" />
                        <Text style={[styles.aboutTitle, isMobile && styles.aboutTitleMobile]}>Reputation System</Text>
                        <Text style={[styles.aboutDescription, isMobile && styles.aboutDescriptionMobile]}>
                            Contributors earn reputation scores based on evidence quality, verification status, and community impact
                        </Text>
                    </View>
                    <View style={[styles.aboutCard, isMobile && styles.aboutCardMobile]}>
                        <Ionicons name="eye" size={32} color="#2E7D32" />
                        <Text style={[styles.aboutTitle, isMobile && styles.aboutTitleMobile]}>Transparent Tracking</Text>
                        <Text style={[styles.aboutDescription, isMobile && styles.aboutDescriptionMobile]}>
                            Publicly accessible ledger ensures complete transparency in environmental evidence collection
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
    userStats: {
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
    userStatsMobile: {
        margin: 16,
        marginTop: 0,
        padding: 20,
    },
    userStatsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: 16,
    },
    userStatsTitleMobile: {
        fontSize: 18,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        flexWrap: 'wrap',
    },
    statsGridMobile: {
        gap: 12,
    },
    statCard: {
        alignItems: 'center',
        padding: 16,
        minWidth: 120,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    ledgerSection: {
        padding: 24,
    },
    ledgerSectionMobile: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    sectionTitleMobile: {
        fontSize: 20,
    },
    filters: {
        flexDirection: 'row',
        gap: 8,
    },
    filtersMobile: {
        gap: 6,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        gap: 6,
    },
    filterButtonActive: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    filterText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    filterTextActive: {
        color: 'white',
    },
    contributionsList: {
        gap: 16,
    },
    contributionsListMobile: {
        gap: 12,
    },
    contributionCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    contributionCardMobile: {
        padding: 16,
    },
    contributionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    contributionInfo: {
        flex: 1,
        marginRight: 12,
    },
    contributionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    contributionTitleMobile: {
        fontSize: 16,
    },
    contributionType: {
        fontSize: 14,
        color: '#666',
    },
    contributionTypeMobile: {
        fontSize: 13,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    contributionDetails: {
        gap: 8,
        marginBottom: 16,
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
        color: '#2c3e50',
        fontWeight: '500',
    },
    blockchainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f8e9',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2E7D32',
        gap: 8,
    },
    blockchainText: {
        fontSize: 12,
        color: '#2E7D32',
        flex: 1,
    },
    noData: {
        alignItems: 'center',
        padding: 40,
    },
    noDataText: {
        fontSize: 16,
        color: '#999',
        marginTop: 8,
        marginBottom: 8,
    },
    noDataSubtext: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
    },
    aboutSection: {
        padding: 24,
        backgroundColor: 'white',
    },
    aboutSectionMobile: {
        padding: 16,
    },
    aboutGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 24,
        marginTop: 24,
    },
    aboutGridMobile: {
        gap: 16,
    },
    aboutCard: {
        backgroundColor: '#f8f9fa',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        minWidth: 250,
        maxWidth: 300,
    },
    aboutCardMobile: {
        minWidth: '100%',
        maxWidth: '100%',
        padding: 20,
    },
    aboutTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginTop: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    aboutTitleMobile: {
        fontSize: 16,
    },
    aboutDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    aboutDescriptionMobile: {
        fontSize: 13,
    },
});