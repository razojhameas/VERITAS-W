import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const FunctionalMap = ({ communities = [], selectedCommunity = null, onCommunitySelect = () => { } }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const webViewRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const generateMapHTML = () => {
        const centerLat = communities.length > 0 ? communities[0].location?.latitude || 14.5995 : 14.5995;
        const centerLng = communities.length > 0 ? communities[0].location?.longitude || 120.9842 : 120.9842;

        const markersHTML = communities.map((community, index) => {
            const lat = community.location?.latitude || centerLat;
            const lng = community.location?.longitude || centerLng;
            const threatColor = getThreatColor(community.ejisScore);

            return `
                new google.maps.Marker({
                    position: { lat: ${lat}, lng: ${lng} },
                    map: map,
                    title: "${community.name}",
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "${threatColor}",
                        fillOpacity: 0.9,
                        strokeColor: "#ffffff",
                        strokeWeight: 2
                    },
                    communityIndex: ${index}
                }).addListener('click', function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'communitySelected',
                        index: ${index},
                        community: "${community.name}",
                        ejisScore: ${community.ejisScore}
                    }));
                });
            `;
        }).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    #map {
                        height: 100%;
                        width: 100%;
                    }
                    html, body {
                        height: 100%;
                        margin: 0;
                        padding: 0;
                    }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <script>
                    let map;
                    function initMap() {
                        map = new google.maps.Map(document.getElementById('map'), {
                            center: { lat: ${centerLat}, lng: ${centerLng} },
                            zoom: 8,
                            styles: [
                                {
                                    "featureType": "administrative",
                                    "elementType": "labels.text.fill",
                                    "stylers": [{ "color": "#444444" }]
                                },
                                {
                                    "featureType": "landscape",
                                    "elementType": "all",
                                    "stylers": [{ "color": "#f2f2f2" }]
                                },
                                {
                                    "featureType": "poi",
                                    "elementType": "all",
                                    "stylers": [{ "visibility": "off" }]
                                },
                                {
                                    "featureType": "road",
                                    "elementType": "all",
                                    "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
                                },
                                {
                                    "featureType": "road.highway",
                                    "elementType": "all",
                                    "stylers": [{ "visibility": "simplified" }]
                                },
                                {
                                    "featureType": "road.arterial",
                                    "elementType": "labels.icon",
                                    "stylers": [{ "visibility": "off" }]
                                },
                                {
                                    "featureType": "transit",
                                    "elementType": "all",
                                    "stylers": [{ "visibility": "off" }]
                                },
                                {
                                    "featureType": "water",
                                    "elementType": "all",
                                    "stylers": [{ "color": "#e8f5e8" }, { "visibility": "on" }]
                                }
                            ]
                        });

                        ${markersHTML}

                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'mapLoaded'
                        }));
                    }
                </script>
                <script 
                    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAPzpxdMMnuY0Fg5Gm7IVrr7-TSLOtEPvc&callback=initMap"
                    async defer>
                </script>
            </body>
            </html>
        `;
    };

    const getThreatColor = (score) => {
        if (score >= 0.2) return '#d32f2f';
        if (score >= 0.15) return '#f57c00';
        if (score >= 0.1) return '#fbc02d';
        return '#2E7D32';
    };

    const handleWebViewMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.type === 'communitySelected') {
                onCommunitySelect(communities[data.index]);
            } else if (data.type === 'mapLoaded') {
                setMapLoaded(true);
            }
        } catch (error) {
            console.error('Error parsing WebView message:', error);
        }
    };

    if (communities.length === 0) {
        return (
            <View style={[styles.placeholder, isMobile && styles.placeholderMobile]}>
                <Ionicons name="map" size={48} color="#2E7D32" />
                <Text style={[styles.placeholderTitle, isMobile && styles.placeholderTitleMobile]}>
                    Environmental Justice Impact Map
                </Text>
                <Text style={[styles.placeholderSubtitle, isMobile && styles.placeholderSubtitleMobile]}>
                    No community data available. Evidence from mobile app will appear here.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ html: generateMapHTML() }}
                style={styles.webview}
                onMessage={handleWebViewMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <Ionicons name="refresh" size={32} color="#2E7D32" />
                        <Text style={styles.loadingText}>Loading Map...</Text>
                    </View>
                )}
            />

            {!mapLoaded && (
                <View style={styles.loadingOverlay}>
                    <Ionicons name="refresh" size={32} color="#2E7D32" />
                    <Text style={styles.loadingText}>Loading Interactive Map...</Text>
                </View>
            )}

            <View style={[styles.legend, isMobile && styles.legendMobile]}>
                <Text style={[styles.legendTitle, isMobile && styles.legendTitleMobile]}>EJIS Threat Levels</Text>
                <View style={styles.legendItems}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: '#2E7D32' }]} />
                        <Text style={[styles.legendText, isMobile && styles.legendTextMobile]}>Low (0.00-0.09)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: '#fbc02d' }]} />
                        <Text style={[styles.legendText, isMobile && styles.legendTextMobile]}>Medium (0.10-0.14)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: '#f57c00' }]} />
                        <Text style={[styles.legendText, isMobile && styles.legendTextMobile]}>High (0.15-0.19)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: '#d32f2f' }]} />
                        <Text style={[styles.legendText, isMobile && styles.legendTextMobile]}>Critical (0.20+)</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: 400,
        position: 'relative',
    },
    webview: {
        flex: 1,
    },
    placeholder: {
        flex: 1,
        backgroundColor: '#e8f5e8',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        borderWidth: 2,
        borderColor: '#2E7D32',
        borderStyle: 'dashed',
        borderRadius: 12,
        minHeight: 300,
    },
    placeholderMobile: {
        padding: 16,
        minHeight: 250,
    },
    placeholderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    placeholderTitleMobile: {
        fontSize: 18,
    },
    placeholderSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    placeholderSubtitleMobile: {
        fontSize: 13,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(248, 249, 250, 0.9)',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#2E7D32',
        fontWeight: '600',
    },
    legend: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        maxWidth: 200,
    },
    legendMobile: {
        maxWidth: 150,
        padding: 8,
    },
    legendTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    legendTitleMobile: {
        fontSize: 11,
    },
    legendItems: {
        gap: 6,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 10,
        color: '#666',
    },
    legendTextMobile: {
        fontSize: 9,
    },
});

export default FunctionalMap;