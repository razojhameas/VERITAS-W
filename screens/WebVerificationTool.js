import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebFooter from '../components/WebFooter';
import { verifyEvidenceIntegrity, getHashFromSimulatedBlockchain } from '../data/apiBlockchain';
import { getRecordFromFirestore } from '../data/apiFirebase';

export default function WebVerificationTool({ user }) {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [txId, setTxId] = useState('');
    const [fileHash, setFileHash] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);

    const handleVerify = async () => {
        if (!txId.trim()) {
            Alert.alert('Error', 'Please enter a Transaction ID or Hash');
            return;
        }

        setLoading(true);
        setVerificationResult(null);

        try {
            let result;

            if (txId.startsWith('0x')) {
                result = await verifyEvidenceIntegrity(txId, fileHash);
            } else {
                const record = await getRecordFromFirestore(txId);
                if (record) {
                    result = await verifyEvidenceIntegrity(record.blockchainTxId, record.sha256Hash);
                    result.recordData = record;
                } else {
                    const blockchainHash = await getHashFromSimulatedBlockchain(txId);
                    if (blockchainHash) {
                        result = {
                            success: true,
                            verified: true,
                            originalHash: blockchainHash,
                            fileHash: fileHash || blockchainHash,
                            txId: txId,
                            message: 'Hash found in blockchain - Evidence integrity confirmed'
                        };
                    } else {
                        result = {
                            success: false,
                            verified: false,
                            message: 'Transaction ID or Hash not found in VERITAS system'
                        };
                    }
                }
            }

            setVerificationResult(result);

            if (result.success) {
                setSearchHistory(prev => [
                    {
                        txId: txId,
                        timestamp: new Date().toISOString(),
                        verified: result.verified,
                        type: result.recordData ? 'Record ID' : 'Transaction ID'
                    },
                    ...prev.slice(0, 4)
                ]);
            }
        } catch (error) {
            console.error('Verification error:', error);
            setVerificationResult({
                success: false,
                verified: false,
                message: 'Verification failed: ' + error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setTxId('');
        setFileHash('');
        setVerificationResult(null);
    };

    const handleUseExample = () => {
        setTxId('0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d');
        setFileHash('');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.hero, isMobile && styles.heroMobile]}>
                <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
                    EcoChain Custody (Verify)
                </Text>
                <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
                    Verify the integrity and authenticity of any environmental evidence using blockchain transaction IDs
                </Text>
            </View>

            <View style={[styles.verificationSection, isMobile && styles.verificationSectionMobile]}>
                <View style={[styles.inputCard, isMobile && styles.inputCardMobile]}>
                    <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                        Verify Evidence Integrity
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Transaction ID / Hash / Record ID</Text>
                        <TextInput
                            style={[styles.input, isMobile && styles.inputMobile]}
                            value={txId}
                            onChangeText={setTxId}
                            placeholder="Enter Transaction ID (0x...), Hash, or Record ID"
                            multiline
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>File Hash (Optional - for direct comparison)</Text>
                        <TextInput
                            style={[styles.input, isMobile && styles.inputMobile]}
                            value={fileHash}
                            onChangeText={setFileHash}
                            placeholder="Enter SHA-256 hash of the file to compare"
                            multiline
                        />
                    </View>

                    <View style={[styles.buttonGroup, isMobile && styles.buttonGroupMobile]}>
                        <TouchableOpacity
                            style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
                            onPress={handleVerify}
                            disabled={loading}
                        >
                            <Ionicons name="search" size={16} color="white" />
                            <Text style={styles.verifyButtonText}>
                                {loading ? 'Verifying...' : 'Verify Evidence'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.exampleButton}
                            onPress={handleUseExample}
                        >
                            <Ionicons name="document-text" size={16} color="#2E7D32" />
                            <Text style={styles.exampleButtonText}>Use Example</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={handleClear}
                        >
                            <Ionicons name="close" size={16} color="#666" />
                            <Text style={styles.clearButtonText}>Clear</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.helpText}>
                        <Ionicons name="information-circle" size={16} color="#2E7D32" />
                        <Text style={styles.helpTextContent}>
                            You can verify using: Transaction ID (0x...), Evidence Record ID, or SHA-256 Hash
                        </Text>
                    </View>
                </View>

                {verificationResult && (
                    <View style={[
                        styles.resultCard,
                        verificationResult.verified ? styles.resultSuccess : styles.resultError,
                        isMobile && styles.resultCardMobile
                    ]}>
                        <View style={styles.resultHeader}>
                            <Ionicons
                                name={verificationResult.verified ? 'checkmark-circle' : verificationResult.success ? 'warning' : 'close-circle'}
                                size={24}
                                color={verificationResult.verified ? '#2E7D32' : verificationResult.success ? '#ff9800' : '#f44336'}
                            />
                            <Text style={[
                                styles.resultTitle,
                                verificationResult.verified ? styles.resultTitleSuccess : styles.resultTitleError
                            ]}>
                                {verificationResult.verified ? 'Verification Successful' :
                                    verificationResult.success ? 'Verification Completed' : 'Verification Failed'}
                            </Text>
                        </View>

                        <Text style={styles.resultMessage}>
                            {verificationResult.message}
                        </Text>

                        {verificationResult.originalHash && (
                            <View style={styles.hashDetails}>
                                <Text style={styles.hashLabel}>Blockchain Hash:</Text>
                                <Text style={styles.hashValue}>{verificationResult.originalHash}</Text>
                            </View>
                        )}

                        {verificationResult.fileHash && verificationResult.fileHash !== verificationResult.originalHash && (
                            <View style={styles.hashDetails}>
                                <Text style={styles.hashLabel}>Provided Hash:</Text>
                                <Text style={styles.hashValue}>{verificationResult.fileHash}</Text>
                            </View>
                        )}

                        {verificationResult.txId && (
                            <View style={styles.txDetails}>
                                <Text style={styles.txLabel}>Transaction ID:</Text>
                                <Text style={styles.txValue}>{verificationResult.txId}</Text>
                            </View>
                        )}

                        {verificationResult.recordData && (
                            <View style={styles.recordDetails}>
                                <Text style={styles.recordTitle}>Evidence Record Details:</Text>
                                <View style={styles.recordInfo}>
                                    <Text style={styles.recordText}>
                                        <Text style={styles.recordLabel}>Type: </Text>
                                        {verificationResult.recordData.type}
                                    </Text>
                                    <Text style={styles.recordText}>
                                        <Text style={styles.recordLabel}>Date: </Text>
                                        {new Date(verificationResult.recordData.timestamp).toLocaleString()}
                                    </Text>
                                    <Text style={styles.recordText}>
                                        <Text style={styles.recordLabel}>Location: </Text>
                                        {verificationResult.recordData.location ?
                                            `${verificationResult.recordData.location.latitude.toFixed(4)}, ${verificationResult.recordData.location.longitude.toFixed(4)}` :
                                            'Unknown'
                                        }
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {searchHistory.length > 0 && (
                    <View style={[styles.historySection, isMobile && styles.historySectionMobile]}>
                        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                            Recent Verifications
                        </Text>
                        <View style={styles.historyList}>
                            {searchHistory.map((search, index) => (
                                <View key={index} style={[styles.historyItem, isMobile && styles.historyItemMobile]}>
                                    <Ionicons
                                        name={search.verified ? 'checkmark-circle' : 'time'}
                                        size={16}
                                        color={search.verified ? '#2E7D32' : '#ff9800'}
                                    />
                                    <View style={styles.historyInfo}>
                                        <Text style={styles.historyTxId}>
                                            {search.txId.substring(0, 20)}...
                                        </Text>
                                        <Text style={styles.historyDetails}>
                                            {search.type} • {new Date(search.timestamp).toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.historyStatus,
                                        { backgroundColor: search.verified ? '#2E7D32' : '#ff9800' }
                                    ]}>
                                        <Text style={styles.historyStatusText}>
                                            {search.verified ? 'Verified' : 'Pending'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>

            <View style={[styles.infoSection, isMobile && styles.infoSectionMobile]}>
                <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                    How Verification Works
                </Text>
                <Text style={[styles.infoDescription, isMobile && styles.infoDescriptionMobile]}>
                    Every evidence record is cryptographically hashed and permanently recorded on the VERITAS blockchain,
                    creating an immutable chain of custody for environmental evidence.
                </Text>
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
    verificationSection: {
        padding: 24,
    },
    verificationSectionMobile: {
        padding: 16,
    },
    inputCard: {
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
    inputCardMobile: {
        padding: 20,
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
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fafafa',
        minHeight: 50,
        textAlignVertical: 'top',
    },
    inputMobile: {
        fontSize: 16,
        minHeight: 60,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    buttonGroupMobile: {
        flexDirection: 'column',
        gap: 8,
    },
    verifyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2E7D32',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 2,
        gap: 8,
    },
    verifyButtonDisabled: {
        backgroundColor: '#a5d6a7',
    },
    verifyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    exampleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f8e9',
        borderWidth: 1,
        borderColor: '#2E7D32',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        gap: 8,
    },
    exampleButtonText: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: '600',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        gap: 8,
    },
    clearButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '600',
    },
    helpText: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f8e9',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2E7D32',
        gap: 8,
    },
    helpTextContent: {
        fontSize: 14,
        color: '#2E7D32',
        fontStyle: 'italic',
        flex: 1,
    },
    resultCard: {
        padding: 24,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 2,
    },
    resultCardMobile: {
        padding: 20,
    },
    resultSuccess: {
        backgroundColor: '#f1f8e9',
        borderColor: '#2E7D32',
    },
    resultError: {
        backgroundColor: '#ffebee',
        borderColor: '#f44336',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    resultTitleSuccess: {
        color: '#2E7D32',
    },
    resultTitleError: {
        color: '#f44336',
    },
    resultMessage: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
    hashDetails: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 6,
        marginBottom: 12,
    },
    hashLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    hashValue: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#333',
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderRadius: 4,
    },
    txDetails: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 6,
        marginBottom: 12,
    },
    txLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    txValue: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#333',
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderRadius: 4,
    },
    recordDetails: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginTop: 12,
    },
    recordTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 12,
    },
    recordInfo: {
        gap: 8,
    },
    recordText: {
        fontSize: 14,
        color: '#666',
    },
    recordLabel: {
        fontWeight: '600',
        color: '#2c3e50',
    },
    historySection: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    historySectionMobile: {
        padding: 20,
    },
    historyList: {
        gap: 12,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        gap: 12,
    },
    historyItemMobile: {
        padding: 12,
    },
    historyInfo: {
        flex: 1,
    },
    historyTxId: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    historyDetails: {
        fontSize: 12,
        color: '#666',
    },
    historyStatus: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    historyStatusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoSection: {
        padding: 24,
        backgroundColor: 'white',
    },
    infoSectionMobile: {
        padding: 16,
    },
    infoDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 600,
        marginHorizontal: 'auto',
    },
    infoDescriptionMobile: {
        fontSize: 14,
        lineHeight: 22,
    },
});