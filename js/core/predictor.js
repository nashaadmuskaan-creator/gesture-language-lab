// ===================================
// PREDICTOR MODULE (UPDATED)
// ===================================
// Live gesture prediction with stability checking

class GesturePredictor {
    constructor() {
        this.isActive = false;
        this.predictionHistory = [];

        // 🔧 Tuned values (important)
        this.historySize = 6;
        this.stabilityThreshold = 0.5;   // 3/6 frames
        this.minConfidence = 0.45;

        // Cooldown instead of hard blocking
        this.lastGestureTime = 0;
        this.gestureCooldown = 800; // ms

        this.lastStableGesture = null;
        this.lastError = null;
        this.expectedGesture = null;
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.predictionLoop();
        console.log('Predictor started');
    }

    stop() {
        this.isActive = false;
        this.reset();
        console.log('Predictor stopped');
    }

    predictionLoop() {
        if (!this.isActive) return;

        if (handTracker.isHandDetected() && trainer.isTrained) {
            const landmarks = handTracker.getLandmarks();
            if (landmarks) {
                const features = handTracker.extractFeatures(landmarks);
                this.makePrediction(features);
            }
        }

        requestAnimationFrame(() => this.predictionLoop());
    }

    makePrediction(features) {
        const result = trainer.predict(features);
        if (!result) return;

        // Ignore low confidence noise
        if (result.confidence < this.minConfidence) {
            this.updatePredictionUI('—', 0);
            return;
        }

        // Add to rolling history
        this.predictionHistory.push(result.label);
        if (this.predictionHistory.length > this.historySize) {
            this.predictionHistory.shift();
        }

        this.updatePredictionUI(result.label, result.confidence);

        if (this.predictionHistory.length >= this.historySize) {
            const stableGesture = this.checkStability();
            const now = Date.now();

            if (
                stableGesture &&
                now - this.lastGestureTime > this.gestureCooldown
            ) {
                this.onStableGesture(stableGesture);
                this.lastStableGesture = stableGesture;
                this.lastGestureTime = now;

                // 🔧 Keep some history instead of nuking it
                this.predictionHistory = this.predictionHistory.slice(-2);
            }
        }
    }

    checkStability() {
        const counts = {};
        this.predictionHistory.forEach(label => {
            counts[label] = (counts[label] || 0) + 1;
        });

        let maxCount = 0;
        let mostCommon = null;

        for (let label in counts) {
            if (counts[label] > maxCount) {
                maxCount = counts[label];
                mostCommon = label;
            }
        }

        return (maxCount / this.historySize >= this.stabilityThreshold)
            ? mostCommon
            : null;
    }

    onStableGesture(gesture) {
        console.log(`Stable gesture detected: ${gesture}`);
        this.addToSentence(gesture);
    }

    addToSentence(gesture) {
        const sentenceOutput = document.getElementById('sentence-output');
        if (!sentenceOutput) return;

        const emptyState = sentenceOutput.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        const currentText = sentenceOutput.textContent.trim();
        sentenceOutput.textContent =
            currentText === '' || currentText === 'Gestures will appear here...'
                ? gesture
                : currentText + ' ' + gesture;
    }

    updatePredictionUI(label, confidence) {
        const symbolElement = document.querySelector('.prediction-symbol');
        if (symbolElement) symbolElement.textContent = label;

        if (learningMode.isEnabled('showConfidence')) {
            const value = document.getElementById('confidence-value');
            const display = document.getElementById('confidence-display');

            if (value && display) {
                const pct = Math.round(confidence * 100);
                value.textContent = `${pct}%`;

                display.classList.remove(
                    'confidence-high',
                    'confidence-medium',
                    'confidence-low'
                );

                if (pct >= 80) display.classList.add('confidence-high');
                else if (pct >= 50) display.classList.add('confidence-medium');
                else display.classList.add('confidence-low');
            }
        }
    }

    reset() {
        this.predictionHistory = [];
        this.lastStableGesture = null;
        this.lastGestureTime = 0;
        this.lastError = null;
        this.expectedGesture = null;
        this.updatePredictionUI('—', 0);
    }

    clearSentence() {
        const sentenceOutput = document.getElementById('sentence-output');
        if (sentenceOutput) {
            sentenceOutput.innerHTML =
                '<p class="empty-state">Gestures will appear here...</p>';
        }
        this.lastStableGesture = null;
        console.log('Sentence cleared');
    }
}

// Global predictor instance
const predictor = new GesturePredictor();
