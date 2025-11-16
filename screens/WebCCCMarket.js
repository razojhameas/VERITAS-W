import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CreditListingCard from '../components/CreditListingCard';
import WebFooter from '../components/WebFooter';
import { calculateEJISScores, getAllRecordsFromFirestore } from '../data/apiFirebase';

export default function WebCCCMarket({ user }) {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [listings, setListings] = useState([]);
    const [marketStats, setMarketStats] = useState({
        totalCredits: 0,
        averagePrice: 0,
        totalRevenue: 0,
        activeProjects: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMarketData();
    }, []);

    const loadMarketData = async () => {
        try {
            setLoading(true);
            const communities = await calculateEJISScores();
            const allRecords = await getAllRecordsFromFirestore();

            const generatedListings = generateListingsFromCommunities(communities, allRecords);
            setListings(generatedListings);

            calculateMarketStats(generatedListings);
        } catch (error) {
            console.error('Error loading market data:', error);
            setListings(getSampleListings());
            calculateMarketStats(getSampleListings());
        } finally {
            setLoading(false);
        }
    };

    const generateListingsFromCommunities = (communities, records) => {
        return communities.map((community, index) => {
            const baseCredits = Math.floor(community.evidenceCount * 100);
            const ejisMultiplier = community.ejisScore * 10;
            const availableCredits = Math.floor(baseCredits * (1 + ejisMultiplier));

            const basePrice = 8.0;
            const threatMultiplier = community.ejisScore * 20;
            const price = parseFloat((basePrice + threatMultiplier).toFixed(2));

            return {
                id: index + 1,
                community: community.name,
                ejisScore: community.ejisScore,
                project: getProjectType(community.primaryThreats),
                availableCredits: availableCredits,
                price: price,
                evidenceCount: community.evidenceCount,
                impactStatement: generateImpactStatement(community),
                location: community.location
            };
        });
    };

    const getProjectType = (threats) => {
        if (threats.some(t => t.includes('Water') || t.includes('Lake') || t.includes('River'))) {
            return 'Water Conservation and Quality Improvement';
        } else if (threats.some(t => t.includes('Forest') || t.includes('Logging') || t.includes('Deforestation'))) {
            return 'Reforestation and Forest Protection';
        } else if (threats.some(t => t.includes('Air') || t.includes('Pollution'))) {
            return 'Air Quality Improvement Initiative';
        } else if (threats.some(t => t.includes('Coastal') || t.includes('Marine') || t.includes('Coral'))) {
            return 'Marine Ecosystem Restoration Project';
        }
        return 'Community Environmental Protection Program';
    };

    const generateImpactStatement = (community) => {
        const impacts = {
            'Marikina Watershed': 'Protecting water sources for 2 million people in Metro Manila',
            'Quezon City Center': 'Improving urban air quality and green spaces for residents',
            'Aurora Province': 'Preserving coastal ecosystems and marine biodiversity',
            'Laguna Lake Area': 'Restoring lake water quality for fishing communities'
        };

        return impacts[community.name] || `Addressing ${community.primaryThreats[0]} in ${community.name}`;
    };

    const calculateMarketStats = (listings) => {
        const totalCredits = listings.reduce((sum, listing) => sum + listing.availableCredits, 0);
        const averagePrice = listings.reduce((sum, listing) => sum + listing.price, 0) / listings.length;
        const totalRevenue = Math.floor(totalCredits * averagePrice);
        const activeProjects = listings.length;

        setMarketStats({
            totalCredits,
            averagePrice: parseFloat(averagePrice.toFixed(2)),
            totalRevenue,
            activeProjects
        });
    };

    const getSampleListings = () => {
        return [
            {
                id: 1,
                community: 'Marikina Watershed Protection',
                ejisScore: 0.21,
                project: 'Reforestation and Watershed Conservation Program',
                availableCredits: 12500,
                price: 12.50,
                evidenceCount: 89,
                impactStatement: 'Preventing soil erosion and protecting water sources for 2M people'
            },
            {
                id: 2,
                community: 'Quezon City Urban Green',
                ejisScore: 0.14,
                project: 'Urban Air Quality Improvement Initiative',
                availableCredits: 8500,
                price: 8.75,
                evidenceCount: 47,
                impactStatement: 'Reducing urban pollution through green infrastructure development'
            }
        ];
    };

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.hero, isMobile && styles.heroMobile]}>
                <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>EcoCredit Hub</Text>
                <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
                    Invest in verified environmental protection while supporting local communities
                    {user && ` - Welcome, ${user.firstName}! Ready to invest?`}
                </Text>
                {!user && (
                    <Text style={[styles.heroNote, isMobile && styles.heroNoteMobile]}>
                        Register to purchase C-CC credits and track your environmental impact
                    </Text>
                )}
            </View>

            {user && (
                <View style={[styles.userStats, isMobile && styles.userStatsMobile]}>
                    <Text style={[styles.userStatsTitle, isMobile && styles.userStatsTitleMobile]}>
                        Your Investment Portfolio
                    </Text>
                    <View style={[styles.userStatsGrid, isMobile && styles.userStatsGridMobile]}>
                        <View style={styles.userStat}>
                            <Text style={styles.userStatValue}>0</Text>
                            <Text style={styles.userStatLabel}>C-CC Owned</Text>
                        </View>
                        <View style={styles.userStat}>
                            <Text style={styles.userStatValue}>$0</Text>
                            <Text style={styles.userStatLabel}>Total Invested</Text>
                        </View>
                        <View style={styles.userStat}>
                            <Text style={styles.userStatValue}>0</Text>
                            <Text style={styles.userStatLabel}>Projects Supported</Text>
                        </View>
                    </View>
                </View>
            )}

            <View style={[styles.marketStats, isMobile && styles.marketStatsMobile]}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>
                        {loading ? '...' : marketStats.totalCredits.toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>Total C-CC Available</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>
                        {loading ? '...' : `$${marketStats.averagePrice}`}
                    </Text>
                    <Text style={styles.statLabel}>Average Price</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>
                        {loading ? '...' : `$${marketStats.totalRevenue.toLocaleString()}`}
                    </Text>
                    <Text style={styles.statLabel}>Total Revenue</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>
                        {loading ? '...' : marketStats.activeProjects}
                    </Text>
                    <Text style={styles.statLabel}>Active Projects</Text>
                </View>
            </View>

            <View style={[styles.howItWorks, isMobile && styles.howItWorksMobile]}>
                <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>How C-CC Trading Works</Text>
                <Text style={[styles.processDescription, isMobile && styles.processDescriptionMobile]}>
                    Community evidence collection generates verifiable carbon credits that support environmental protection projects
                </Text>
            </View>

            <View style={[styles.listings, isMobile && styles.listingsMobile]}>
                <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                    Available C-CC Listings {loading && '(Loading...)'}
                </Text>
                <Text style={[styles.sectionDescription, isMobile && styles.sectionDescriptionMobile]}>
                    Each credit represents verified environmental protection with transparent impact tracking
                    {user && ' - Click "Buy Now" to simulate purchase'}
                </Text>

                <View style={[styles.listingsGrid, isMobile && styles.listingsGridMobile]}>
                    {listings.map(listing => (
                        <CreditListingCard key={listing.id} listing={listing} user={user} />
                    ))}
                </View>

                {listings.length === 0 && !loading && (
                    <View style={styles.noListings}>
                        <Text style={styles.noListingsText}>No C-CC listings available</Text>
                        <Text style={styles.noListingsSubtext}>
                            Community carbon credits will appear here when evidence is submitted from the mobile app
                        </Text>
                    </View>
                )}
            </View>

            <View style={[styles.benefits, isMobile && styles.benefitsMobile]}>
                <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>Benefits of C-CC Investment</Text>
                <View style={[styles.benefitsGrid, isMobile && styles.benefitsGridMobile]}>
                    <View style={[styles.benefitCard, isMobile && styles.benefitCardMobile]}>
                        <Ionicons name="eye" size={32} color="#2E7D32" />
                        <Text style={[styles.benefitTitle, isMobile && styles.benefitTitleMobile]}>Transparent Impact</Text>
                        <Text style={[styles.benefitDescription, isMobile && styles.benefitDescriptionMobile]}>
                            Every credit is backed by blockchain-verified evidence of environmental protection
                        </Text>
                    </View>
                    <View style={[styles.benefitCard, isMobile && styles.benefitCardMobile]}>
                        <Ionicons name="people" size={32} color="#2E7D32" />
                        <Text style={[styles.benefitTitle, isMobile && styles.benefitTitleMobile]}>Direct Community Support</Text>
                        <Text style={[styles.benefitDescription, isMobile && styles.benefitDescriptionMobile]}>
                            85% of revenue goes directly to local communities for conservation efforts
                        </Text>
                    </View>
                    <View style={[styles.benefitCard, isMobile && styles.benefitCardMobile]}>
                        <Ionicons name="refresh" size={32} color="#2E7D32" />
                        <Text style={[styles.benefitTitle, isMobile && styles.benefitTitleMobile]}>Real-time Monitoring</Text>
                        <Text style={[styles.benefitDescription, isMobile && styles.benefitDescriptionMobile]}>
                            Track the impact of your investment through live EJIS score updates
                        </Text>
                    </View>
                    <View style={[styles.benefitCard, isMobile && styles.benefitCardMobile]}>
                        <Ionicons name="checkmark-circle" size={32} color="#2E7D32" />
                        <Text style={[styles.benefitTitle, isMobile && styles.benefitTitleMobile]}>Verified Environmental Impact</Text>
                        <Text style={[styles.benefitDescription, isMobile && styles.benefitDescriptionMobile]}>
                            Each credit represents measurable reduction in environmental threats
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
    userStats: {
        backgroundColor: '#2c3e50',
        padding: 24,
        margin: 24,
        marginTop: 0,
        borderRadius: 12,
    },
    userStatsMobile: {
        margin: 16,
        marginTop: 0,
        padding: 20,
    },
    userStatsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 16,
    },
    userStatsTitleMobile: {
        fontSize: 18,
    },
    userStatsGrid: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 32,
    },
    userStatsGridMobile: {
        gap: 24,
    },
    userStat: {
        alignItems: 'center',
    },
    userStatValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 4,
    },
    userStatLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    marketStats: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 32,
        gap: 32,
        backgroundColor: 'white',
        flexWrap: 'wrap',
    },
    marketStatsMobile: {
        padding: 16,
        gap: 16,
    },
    stat: {
        alignItems: 'center',
        minWidth: 120,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    howItWorks: {
        padding: 32,
        backgroundColor: '#f8f9fa',
    },
    howItWorksMobile: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 16,
        textAlign: 'center',
    },
    sectionTitleMobile: {
        fontSize: 24,
    },
    processDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 600,
        marginHorizontal: 'auto',
    },
    processDescriptionMobile: {
        fontSize: 14,
        lineHeight: 22,
    },
    listings: {
        padding: 32,
        backgroundColor: 'white',
    },
    listingsMobile: {
        padding: 16,
    },
    sectionDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    sectionDescriptionMobile: {
        fontSize: 14,
        marginBottom: 24,
    },
    listingsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
    },
    listingsGridMobile: {
        gap: 12,
    },
    noListings: {
        alignItems: 'center',
        padding: 40,
    },
    noListingsText: {
        fontSize: 18,
        color: '#999',
        marginBottom: 8,
    },
    noListingsSubtext: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
    },
    benefits: {
        padding: 32,
        backgroundColor: '#f8f9fa',
    },
    benefitsMobile: {
        padding: 16,
    },
    benefitsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 24,
        marginTop: 32,
    },
    benefitsGridMobile: {
        gap: 16,
        marginTop: 24,
    },
    benefitCard: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        minWidth: 250,
        maxWidth: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    benefitCardMobile: {
        minWidth: '100%',
        maxWidth: '100%',
        padding: 20,
    },
    benefitTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginTop: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    benefitTitleMobile: {
        fontSize: 16,
    },
    benefitDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    benefitDescriptionMobile: {
        fontSize: 13,
    },
});