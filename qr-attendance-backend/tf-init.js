const tf = require('@tensorflow/tfjs-core');
require('@tensorflow/tfjs-backend-wasm');

let backendInitialized = false;

async function initializeBackend() {
  if (!backendInitialized) {
    await tf.setBackend('wasm');
    await tf.ready();
    backendInitialized = true;
    console.log('TensorFlow.js backend set to WASM');
  }
}

module.exports = { initializeBackend };