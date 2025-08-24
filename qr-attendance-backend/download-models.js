const fs = require('fs');
const path = require('path');
const https = require('https');

// Create face-models directory if it doesn't exist
const modelsDir = path.join(__dirname, 'face-models');
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
    console.log('Created face-models directory');
}

// Files to download - corrected with actual available files
const files = [
    // SSD MobileNetV1 model (has 2 shards)
    {
        url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard1',
        filename: 'ssd_mobilenetv1_model-shard1'
    },
    {
        url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard2',
        filename: 'ssd_mobilenetv1_model-shard2'
    },
    {
        url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-weights_manifest.json',
        filename: 'ssd_mobilenetv1_model-weights_manifest.json'
    },
    
    // Face Landmark 68 model (only has 1 shard)
    {
        url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1',
        filename: 'face_landmark_68_model-shard1'
    },
    {
        url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json',
        filename: 'face_landmark_68_model-weights_manifest.json'
    },
    
    // Face Recognition model (has 2 shards)
    {
        url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1',
        filename: 'face_recognition_model-shard1'
    },
    {
        url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2',
        filename: 'face_recognition_model-shard2'
    },
    {
        url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json',
        filename: 'face_recognition_model-weights_manifest.json'
    }
];

// Download function
function downloadFile(url, filename) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(modelsDir, filename);
        const fileStream = fs.createWriteStream(filePath);
        
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log(`Downloaded: ${filename}`);
                    resolve();
                });
            } else {
                reject(new Error(`Failed to download ${filename}. Status: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(filePath, () => {}); // Delete the file if there was an error
            reject(err);
        });
    });
}

// Download all files
async function downloadAllFiles() {
    console.log('Starting download of face-api.js models...');
    
    for (const file of files) {
        try {
            await downloadFile(file.url, file.filename);
        } catch (error) {
            console.error(`Error downloading ${file.filename}:`, error.message);
        }
    }
    
    console.log('Download completed!');
    console.log(`Your models directory (${modelsDir}) should now contain all required files.`);
}

// Run the download
downloadAllFiles().catch(console.error);