import axios from 'axios';

// Replace with your computer's local IP address. 'localhost' won't work with the emulator/device.
const API_BASE_URL = 'http://192.168.1.6:5000/api'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export default apiClient;