
import { doc, setDoc, getDoc, collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Test Firestore connection
export const testFirestoreConnection = async () => {
    try {
        await getDocs(collection(db, 'evidence_records'));
        console.log('VERITAS Firestore connection test: SUCCESS');
        return true;
    } catch (error) {
        console.log('VERITAS Firestore connection: Using simulated mode');
        return false;
    }
};

// Get all evidence records from Firestore
export const getAllRecordsFromFirestore = async () => {
    try {
        const recordsRef = collection(db, 'evidence_records');
        const q = query(recordsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const records = [];

        querySnapshot.forEach((doc) => {
            records.push({ id: doc.id, ...doc.data() });
        });

        console.log(`Retrieved ${records.length} records from VERITAS Firestore`);
        return records;
    } catch (error) {
        console.error('Error getting all records from Firestore:', error);
        return [];
    }
};

// Get records by user ID
export const getRecordsByUser = async (userId) => {
    try {
        const recordsRef = collection(db, 'evidence_records');
        const q = query(recordsRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const records = [];

        querySnapshot.forEach((doc) => {
            records.push({ id: doc.id, ...doc.data() });
        });

        console.log(`Retrieved ${records.length} records for user ${userId}`);
        return records;
    } catch (error) {
        console.error('Error getting user records from Firestore:', error);
        return [];
    }
};

// Get real-time updates for evidence records
export const subscribeToEvidenceUpdates = (callback) => {
    const recordsRef = collection(db, 'evidence_records');
    const q = query(recordsRef, orderBy('timestamp', 'desc'));

    return onSnapshot(q, (querySnapshot) => {
        const records = [];
        querySnapshot.forEach((doc) => {
            records.push({ id: doc.id, ...doc.data() });
        });
        callback(records);
    });
};

// Calculate EJIS scores from real evidence data
export const calculateEJISScores = async (region = null) => {
    try {
        const allRecords = await getAllRecordsFromFirestore();

        // Group records by community/region
        const communities = {};

        allRecords.forEach(record => {
            if (record.location) {
                // Simple region grouping based on coordinates
                const regionKey = getRegionKey(record.location.latitude, record.location.longitude);

                if (!communities[regionKey]) {
                    communities[regionKey] = {
                        name: getRegionName(record.location.latitude, record.location.longitude),
                        records: [],
                        location: record.location
                    };
                }
                communities[regionKey].records.push(record);
            }
        });

        // Calculate EJIS score for each community
        const scores = Object.values(communities).map(community => {
            const score = calculateCommunityEJIS(community.records);
            return {
                ...community,
                ejisScore: score,
                evidenceCount: community.records.length,
                threatLevel: getThreatLevel(score),
                primaryThreats: analyzeThreats(community.records)
            };
        });

        return scores;
    } catch (error) {
        console.error('Error calculating EJIS scores:', error);
        return [];
    }
};

// Helper function to calculate community EJIS score
const calculateCommunityEJIS = (records) => {
    if (records.length === 0) return 0;

    // Base score on evidence density and recency
    const now = new Date();
    const recentRecords = records.filter(record => {
        const recordTime = new Date(record.timestamp);
        const daysAgo = (now - recordTime) / (1000 * 60 * 60 * 24);
        return daysAgo <= 30; // Last 30 days
    });

    const evidenceDensity = records.length / 100; // Normalize
    const recencyFactor = recentRecords.length / Math.max(records.length, 1);

    // Score between 0 and 0.25
    return Math.min(0.25, (evidenceDensity * 0.15) + (recencyFactor * 0.1));
};

// Analyze primary threats from evidence
const analyzeThreats = (records) => {
    const threatCounts = {};
    records.forEach(record => {
        const threat = inferThreatFromEvidence(record);
        threatCounts[threat] = (threatCounts[threat] || 0) + 1;
    });

    return Object.entries(threatCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([threat]) => threat);
};

// Infer threat type from evidence
const inferThreatFromEvidence = (record) => {
    // Simple inference based on evidence type and location
    if (record.type === 'photo') {
        return 'Visual Documentation';
    } else if (record.type === 'video') {
        return 'Video Evidence';
    }
    return 'Environmental Concern';
};

// Get threat level from EJIS score
const getThreatLevel = (score) => {
    if (score >= 0.2) return 'CRITICAL';
    if (score >= 0.15) return 'HIGH';
    if (score >= 0.1) return 'MEDIUM';
    return 'LOW';
};

// Helper function to group by region
const getRegionKey = (lat, lng) => {
    // Round to 1 decimal place for regional grouping (~11km resolution)
    return `${lat.toFixed(1)},${lng.toFixed(1)}`;
};

const getRegionName = (lat, lng) => {
    // Simple region naming based on coordinates
    // In production, you'd use reverse geocoding
    const regions = {
        '14.7,121.0': 'Quezon City Center',
        '15.8,121.5': 'Aurora Province',
        '14.7,121.2': 'Marikina Watershed',
        '14.3,121.2': 'Laguna Lake Area'
    };

    const key = getRegionKey(lat, lng);
    return regions[key] || `Region ${key}`;
};

// Get blockchain transactions
export const getBlockchainTransactions = async () => {
    try {
        const blockchainRef = collection(db, 'blockchain_transactions');
        const q = query(blockchainRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const transactions = [];

        querySnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });

        console.log(`Retrieved ${transactions.length} blockchain transactions`);
        return transactions;
    } catch (error) {
        console.error('Error getting blockchain transactions:', error);
        return [];
    }
};
