import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GoogleMap = ({ communities = [], onCommunitySelect = () => { } }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(false);

    useEffect(() => {
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAPzpxdMMnuY0Fg5Gm7IVrr7-TSLOtEPvc&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = initializeMap;
            script.onerror = () => {
                console.error('Failed to load Google Maps script');
                setMapError(true);
            };
            document.head.appendChild(script);
        } else {
            initializeMap();
        }

        return () => {
        };
    }, []);

    useEffect(() => {
        if (mapLoaded && communities.length > 0) {
            addMarkersToMap();
        }
    }, [mapLoaded, communities]);

    const initializeMap = () => {
        try {
            const center = communities.length > 0
                ? { lat: communities[0].location?.latitude || 14.5995, lng: communities[0].location?.longitude || 120.9842 }
                : { lat: 14.5995, lng: 120.9842 };

            const map = new window.google.maps.Map(mapRef.current, {
                center,
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
                ],
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                zoomControl: true,
            });

            window.map = map;
            setMapLoaded(true);
        } catch (error) {
            console.error('Error initializing map:', error);
            setMapError(true);
        }
    };

    const addMarkersToMap = () => {
        if (!window.map) return;

        if (window.markers) {
            window.markers.forEach(marker => marker.setMap(null));
        }

        window.markers = [];

        communities.forEach((community, index) => {
            const position = {
                lat: community.location?.latitude || 14.5995,
                lng: community.location?.longitude || 120.9842
            };

            const marker = new window.google.maps.Marker({
                position,
                map: window.map,
                title: community.name,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: getThreatColor(community.ejisScore),
                    fillOpacity: 0.9,
                    strokeColor: "#ffffff",
                    strokeWeight: 2
                }
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 8px; max-width: 200px;">
                        <h3 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 14px;">${community.name}</h3>
                        <p style="margin: 4px 0; font-size: 12px; color: #666;">
                            <strong>EJIS Score:</strong> ${community.ejisScore}
                        </p>
                        <p style="margin: 4px 0; font-size: 12px; color: #666;">
                            <strong>Evidence Records:</strong> ${community.evidenceCount}
                        </p>
                        <p style="margin: 4px 0; font-size: 12px; color: #666;">
                            <strong>Threat Level:</strong> ${getThreatLevel(community.ejisScore)}
                        </p>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(window.map, marker);
                onCommunitySelect(community);
            });

            window.markers.push(marker);
        });
    };

    const getThreatColor = (score) => {
        if (score >= 0.2) return '#d32f2f';
        if (score >= 0.15) return '#f57c00';
        if (score >= 0.1) return '#fbc02d';
        return '#2E7D32';
    };

    const getThreatLevel = (score) => {
        if (score >= 0.2) return 'CRITICAL';
        if (score >= 0.15) return 'HIGH';
        if (score >= 0.1) return 'MEDIUM';
        return 'LOW';
    };

    if (mapError) {
        return (
            <View style={[styles.placeholder, isMobile && styles.placeholderMobile]}>
                <Ionicons name="warning" size={48} color="#ff9800" />
                <Text style={[styles.placeholderTitle, isMobile && styles.placeholderTitleMobile]}>
                    Map Loading Error
                </Text>
                <Text style={[styles.placeholderSubtitle, isMobile && styles.placeholderSubtitleMobile]}>
                    Unable to load Google Maps. Please check your connection and try again.
                </Text>
            </View>
        );
    }

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
            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px'
                }}
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
        borderRadius: 8,
        overflow: 'hidden',
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
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(248, 249, 250, 0.9)',
        zIndex: 10,
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

export default GoogleMap;