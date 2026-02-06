// ===================================
// MAIN APPLICATION
// ===================================
// Entry point - coordinates all modules

class GestureLanguageLabApp {
    constructor() {
        this.isInitialized = false;
    }

    // Initialize the application
    async initialize() {
        console.log('========================================');
        console.log('Gesture Language Lab - Initializing...');
        console.log('========================================');

        try {
            // 1. Apply mode settings
            console.log('Step 1: Applying mode settings...');
            learningMode.applyModeUI();

            // 2. Initialize UI components
            console.log('Step 2: Initializing UI components...');
            panels.initialize();
            controls.initialize();
            output.initialize();

            // 3. Initialize camera
            console.log('Step 3: Initializing camera...');
            const cameraReady = await camera.initialize();
            
            if (!cameraReady) {
                throw new Error('Camera initialization failed');
            }

            // 4. Initialize hand tracking
            console.log('Step 4: Initializing MediaPipe Hands...');
            const handsReady = await handTracker.initialize(camera.getVideoElement());
            
            if (!handsReady) {
                throw new Error('Hand tracking initialization failed');
            }

            // 5. Setup hand detection callback
            handTracker.onHandDetected((landmarks) => {
                // Update record button state when hand is detected
                controls.updateRecordButtonState(true);
            });

            // Monitor hand detection status for record button
            this.startHandMonitoring();

            this.isInitialized = true;

            console.log('========================================');
            console.log('✅ Initialization Complete!');
            console.log(`Mode: ${learningMode.getDisplayName()}`);
            console.log('Ready to collect data and train models');
            console.log('========================================');

        } catch (error) {
            console.error('Initialization failed:', error);
            alert('Failed to initialize the application. Please refresh and try again.');
        }
    }

    // Monitor hand detection status
    startHandMonitoring() {
        setInterval(() => {
            const handDetected = handTracker.isHandDetected();
            controls.updateRecordButtonState(handDetected);
        }, 500);
    }

    // Cleanup on page unload
    cleanup() {
        console.log('Cleaning up resources...');
        
        predictor.stop();
        camera.stop();
        
        if (trainer.model) {
            trainer.reset();
        }
    }
}

// ===================================
// APPLICATION STARTUP
// ===================================

// Create app instance
const app = new GestureLanguageLabApp();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await app.initialize();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    app.cleanup();
});

// Handle visibility changes (pause/resume)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - pausing prediction');
        if (predictor.isActive) {
            predictor.stop();
        }
    } else {
        console.log('Page visible - resuming');
        if (trainer.isTrained && !predictor.isActive) {
            predictor.start();
        }
    }
});