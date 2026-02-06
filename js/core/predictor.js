// ===================================
// PREDICTOR MODULE
// ===================================
// Live gesture prediction with stability checking

class GesturePredictor {
    constructor() {
        this.isActive = false;
        this.predictionHistory = [];
        this.historySize = 10;
        this.stabilityThreshold = 0.7;  // 70% of recent predictions must match
        this.lastStableGesture = null;
        this.minConfidence = 0.6;
        this.lastError = null;  // Track last prediction error
        this.expectedGesture = null;  // For error detection
    }

    // Start continuous prediction
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.predictionLoop();
        console.log('Predictor started');
    }

    // Stop prediction
    stop() {
        this.isActive = false;
        this.reset();
        console.log('Predictor stopped');
    }

    // Main prediction loop
    predictionLoop() {
        if (!this.isActive) return;

        // Check if hand is detected and model is trained
        if (handTracker.isHandDetected() && trainer.isTrained) {
            const landmarks = handTracker.getLandmarks();
            
            if (landmarks) {
                const features = handTracker.extractFeatures(landmarks);
                this.makePrediction(features);
            }
        }

        // Continue loop
        requestAnimationFrame(() => this.predictionLoop());
    }

    // Make a single prediction
    makePrediction(features) {
        const result = trainer.predict(features);
        
        if (!result) return;

        // Check minimum confidence
        if (result.confidence < this.minConfidence) {
            this.updatePredictionUI('—', 0);
            return;
        }

        // Add to history
        this.predictionHistory.push(result.label);
        
        // Keep history size manageable
        if (this.predictionHistory.length > this.historySize) {
            this.predictionHistory.shift();
        }

        // Update UI with current prediction
        this.updatePredictionUI(result.label, result.confidence);

        // Check for stable gesture
        if (this.predictionHistory.length >= this.historySize) {
            const stableGesture = this.checkStability();
            
            if (stableGesture && stableGesture !== this.lastStableGesture) {
                this.onStableGesture(stableGesture);
                this.lastStableGesture = stableGesture;
            }
        }
    }

    // Check if predictions are stable
    checkStability() {
        if (this.predictionHistory.length < this.historySize) {
            return null;
        }

        // Count occurrences of each label
        const counts = {};
        this.predictionHistory.forEach(label => {
            counts[label] = (counts[label] || 0) + 1;
        });

        // Find most common label
        let maxCount = 0;
        let mostCommon = null;

        for (let label in counts) {
            if (counts[label] > maxCount) {
                maxCount = counts[label];
                mostCommon = label;
            }
        }

        // Check if it meets stability threshold
        const stability = maxCount / this.historySize;
        
        if (stability >= this.stabilityThreshold) {
            return mostCommon;
        }

        return null;
    }

    // Handle stable gesture detection
    onStableGesture(gesture) {
        console.log(`Stable gesture detected: ${gesture}`);
        
        // Add to sentence builder
        this.addToSentence(gesture);
        
        // Clear history to avoid duplicate additions
        this.predictionHistory = [];
    }

    // Add gesture to sentence
    addToSentence(gesture) {
        const sentenceOutput = document.getElementById('sentence-output');
        
        if (!sentenceOutput) return;

        // Remove empty state if present
        const emptyState = sentenceOutput.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        // Add gesture
        const currentText = sentenceOutput.textContent.trim();
        
        if (currentText === '' || currentText === 'Gestures will appear here...') {
            sentenceOutput.textContent = gesture;
        } else {
            sentenceOutput.textContent = currentText + ' ' + gesture;
        }
    }

    // Update prediction UI
    updatePredictionUI(label, confidence) {
        // Update predicted symbol
        const symbolElement = document.querySelector('.prediction-symbol');
        if (symbolElement) {
            symbolElement.textContent = label;
        }

        // Update confidence (In-Depth mode only)
        if (learningMode.isEnabled('showConfidence')) {
            const confidenceValue = document.getElementById('confidence-value');
            const confidenceDisplay = document.getElementById('confidence-display');
            
            if (confidenceValue && confidenceDisplay) {
                const percentage = Math.round(confidence * 100);
                confidenceValue.textContent = `${percentage}%`;
                
                // Color-code confidence
                confidenceDisplay.classList.remove('confidence-high', 'confidence-medium', 'confidence-low');
                
                if (percentage >= 80) {
                    confidenceDisplay.classList.add('confidence-high');
                } else if (percentage >= 50) {
                    confidenceDisplay.classList.add('confidence-medium');
                } else {
                    confidenceDisplay.classList.add('confidence-low');
                }
            }
        }
    }

    // Detect and log prediction errors (In-Depth mode only)
    detectError(predictedLabel, expectedLabel) {
        if (!learningMode.isEnabled('showErrorInsights')) return;
        
        if (expectedLabel && predictedLabel !== expectedLabel) {
            this.lastError = {
                expected: expectedLabel,
                predicted: predictedLabel,
                timestamp: Date.now()
            };
            
            this.updateErrorInsights();
        }
    }

    // Update error insights panel
    updateErrorInsights() {
        if (!learningMode.isEnabled('showErrorInsights') || !this.lastError) return;

        const errorContent = document.getElementById('error-content');
        if (!errorContent) return;

        const html = `
            <div class="error-detail">
                <span class="error-label">Expected:</span> 
                <span class="error-value">${this.lastError.expected}</span>
            </div>
            <div class="error-detail">
                <span class="error-label">Predicted:</span> 
                <span class="error-value">${this.lastError.predicted}</span>
            </div>
            <div class="error-detail">
                <span class="error-label">Possible reasons:</span>
                <ul class="error-reasons">
                    <li>Similar hand gestures</li>
                    <li>Insufficient training data</li>
                    <li>Poor hand angle or lighting</li>
                    <li>Hand partially occluded</li>
                </ul>
            </div>
        `;

        errorContent.innerHTML = html;
    }

    // Reset predictor state
    reset() {
        this.predictionHistory = [];
        this.lastStableGesture = null;
        this.lastError = null;
        this.expectedGesture = null;
        this.updatePredictionUI('—', 0);
        
        // Clear error insights
        if (learningMode.isEnabled('showErrorInsights')) {
            const errorContent = document.getElementById('error-content');
            if (errorContent) {
                errorContent.innerHTML = '<p class="empty-state">No errors detected yet</p>';
            }
        }
    }

    // Clear sentence
    clearSentence() {
        const sentenceOutput = document.getElementById('sentence-output');
        if (sentenceOutput) {
            sentenceOutput.innerHTML = '<p class="empty-state">Gestures will appear here...</p>';
        }
        this.lastStableGesture = null;
        console.log('Sentence cleared');
    }
}

// Global predictor instance
const predictor = new GesturePredictor();