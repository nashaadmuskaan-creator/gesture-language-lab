// ===================================
// CAMERA MODULE
// ===================================
// Manages webcam access and video stream

class CameraManager {
    constructor() {
        this.videoElement = document.getElementById('webcam');
        this.stream = null;
        this.isReady = false;
    }

    // Initialize camera and request permissions
    async initialize() {
        console.log('Initializing camera...');

        try {
            // Request camera permission
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            // Set video source
            this.videoElement.srcObject = this.stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve();
                };
            });

            this.isReady = true;
            console.log('Camera initialized successfully');
            
            return true;

        } catch (error) {
            console.error('Camera initialization failed:', error);
            this.handleCameraError(error);
            return false;
        }
    }

    // Handle camera errors
    handleCameraError(error) {
        let message = 'Could not access camera. ';
        
        if (error.name === 'NotAllowedError') {
            message += 'Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
            message += 'No camera found on this device.';
        } else {
            message += 'Please check your camera settings.';
        }

        alert(message);
    }

    // Get video element
    getVideoElement() {
        return this.videoElement;
    }

    // Check if camera is ready
    isCameraReady() {
        return this.isReady;
    }

    // Stop camera stream
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.isReady = false;
            console.log('Camera stopped');
        }
    }
}

// Global camera instance
const camera = new CameraManager();