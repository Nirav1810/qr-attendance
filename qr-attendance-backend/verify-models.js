const fs = require('fs');
const path = require('path');

// Define the expected model files
const modelFiles = [
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-weights_manifest.json'
];

// Define possible model locations
const possibleLocations = [
    path.join(__dirname, 'face-models'),
    path.join(__dirname, 'qr-attendance-backend', 'face-models'),
    path.join(__dirname, 'models', 'face-api'),
    path.join(__dirname, 'models')
];

console.log('Checking for face-api.js model files...\n');

let foundLocation = null;

for (const location of possibleLocations) {
    console.log(`Checking location: ${location}`);
    
    if (fs.existsSync(location)) {
        const files = fs.readdirSync(location);
        let allFilesFound = true;
        
        for (const file of modelFiles) {
            if (!files.includes(file)) {
                console.log(`  Missing: ${file}`);
                allFilesFound = false;
            }
        }
        
        if (allFilesFound) {
            console.log(`  ✓ All model files found!`);
            foundLocation = location;
            break;
        } else {
            console.log(`  ✗ Some files missing`);
        }
    } else {
        console.log(`  ✗ Directory does not exist`);
    }
    
    console.log('');
}

if (foundLocation) {
    console.log(`\n✓ Models found at: ${foundLocation}`);
    console.log('\nUpdate your route files with:');
    console.log(`const MODEL_URL = '${foundLocation.replace(/\\/g, '\\\\')}';`);
} else {
    console.log('\n✗ Model files not found in any expected location');
    console.log('\nPlease download the model files and place them in one of these locations:');
    possibleLocations.forEach(loc => console.log(`  - ${loc}`));
}