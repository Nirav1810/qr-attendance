import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { RNCamera } from 'react-native-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

const ScannerScreen = ({ navigation }) => {
  const [isScanning, setIsScanning] = useState(true);

  const handleBarCodeRead = async ({ data }) => {
    if (!isScanning) return;
    setIsScanning(false); // Prevent multiple scans

    try {
      const token = await AsyncStorage.getItem('userToken');
      // For now, let's hardcode a courseId. In a real app, the student would select this.
      const courseId = 'CS101'; 
      
      const response = await apiClient.post('/attendance/mark', 
        { qrToken: data, courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', response.data.message, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to mark attendance.', [
        { text: 'Try Again', onPress: () => setIsScanning(true) }, // Allow user to try again
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        onBarCodeRead={isScanning ? handleBarCodeRead : null}
        captureAudio={false}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
      >
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Scan the QR Code</Text>
          <View style={styles.scanBox} />
        </View>
      </RNCamera>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column', backgroundColor: 'black' },
  preview: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 100,
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
  backButton: {
    position: 'absolute',
    bottom: 50,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
  },
  backButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default ScannerScreen;