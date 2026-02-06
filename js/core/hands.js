// ===================================
// HANDS MODULE
// ===================================
// MediaPipe Hands integration for landmark detection

class HandTracker {
    constructor() {
        this.hands = null;
        this.canvasElement = document.getElementById('canvas');
        this.canvasCtx = this.canvasElement.getContext('2d');
        this.currentLandmarks = null;
        this.handDetected = false;
        this.onResultsCallback = null;
    }

    // Initialize MediaPipe Hands
    async initialize(videoElement) {
        console.log('Initializing MediaPipe Hands...');

        try {
            // Create Hands instance
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            // Configure Hands settings
            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.5
            });

            // Set up results callback
            this.hands.onResults((results) => this.onResults(results));

            // Create camera instance
            const mpCamera = new Camera(videoElement, {
                onFrame: async () => {
                    await this.hands.send({ image: videoElement });
                },
                width: 640,
                height: 480
            });

            // Start camera
            await mpCamera.start();

            console.log('MediaPipe Hands initialized successfully');
            return true;

        } catch (error) {
            console.error('MediaPipe initialization failed:', error);
            return false;
        }
    }

    // Process MediaPipe results
    onResults(results) {
        // Update canvas size to match video
        const videoElement = camera.getVideoElement();
        this.canvasElement.width = videoElement.videoWidth;
        this.canvasElement.height = videoElement.videoHeight;

        // Clear canvas
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        // Check if hand is detected
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            this.handDetected = true;
            this.currentLandmarks = results.multiHandLandmarks[0];

            // Draw landmarks
            this.drawLandmarks(this.currentLandmarks);

            // Update hand status indicator
            this.updateHandStatus(true);

            // Call external callback if registered
            if (this.onResultsCallback) {
                this.onResultsCallback(this.currentLandmarks);
            }

        } else {
            this.handDetected = false;
            this.currentLandmarks = null;
            this.updateHandStatus(false);
        }

        this.canvasCtx.restore();
    }

    // Draw hand landmarks on canvas
    drawLandmarks(landmarks) {
        // Draw connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],           // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],           // Index
            [0, 9], [9, 10], [10, 11], [11, 12],      // Middle
            [0, 13], [13, 14], [14, 15], [15, 16],    // Ring
            [0, 17], [17, 18], [18, 19], [19, 20],    // Pinky
            [5, 9], [9, 13], [13, 17]                 // Palm
        ];

        // Draw lines
        this.canvasCtx.strokeStyle = '#22d3ee';
        this.canvasCtx.lineWidth = 2;

        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];

            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(
                startPoint.x * this.canvasElement.width,
                startPoint.y * this.canvasElement.height
            );
            this.canvasCtx.lineTo(
                endPoint.x * this.canvasElement.width,
                endPoint.y * this.canvasElement.height
            );
            this.canvasCtx.stroke();
        });

        // Draw landmarks (points)
        landmarks.forEach((landmark, index) => {
            const x = landmark.x * this.canvasElement.width;
            const y = landmark.y * this.canvasElement.height;

            // Wrist and finger tips are larger
            const isKeyPoint = [0, 4, 8, 12, 16, 20].includes(index);
            const radius = isKeyPoint ? 6 : 4;

            this.canvasCtx.fillStyle = '#a78bfa';
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(x, y, radius, 0, 2 * Math.PI);
            this.canvasCtx.fill();
        });
    }

    // Update hand detection status indicator
    updateHandStatus(detected) {
        const statusElement = document.getElementById('hand-status');
        if (statusElement) {
            if (detected) {
                statusElement.textContent = 'Hand detected';
                statusElement.classList.add('active');
            } else {
                statusElement.textContent = 'No hand detected';
                statusElement.classList.remove('active');
            }
        }
    }

    // Register callback for hand detection
    onHandDetected(callback) {
        this.onResultsCallback = callback;
    }

    // Get current landmarks
    getLandmarks() {
        return this.currentLandmarks;
    }

    // Check if hand is detected
    isHandDetected() {
        return this.handDetected;
    }

    // Extract landmark features as flat array
    extractFeatures(landmarks) {
        if (!landmarks) return null;

        // Flatten landmarks into [x1, y1, z1, x2, y2, z2, ...]
        const features = [];
        landmarks.forEach(landmark => {
            features.push(landmark.x, landmark.y, landmark.z);
        });

        return features;
    }
}

// Global hand tracker instance
const handTracker = new HandTracker();