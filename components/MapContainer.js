import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

const MapContainer = ({ children }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    return (
        <div style={{
            ...styles.container,
            height: isMobile ? 400 : 500,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            {children}
        </div>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        backgroundColor: '#f8f9fa',
    },
});

export default MapContainer;