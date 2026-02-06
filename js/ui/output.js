// ===================================
// OUTPUT MODULE
// ===================================
// Manages prediction display and sentence builder

class OutputManager {
    constructor() {
        this.predictionSymbol = document.querySelector('.prediction-symbol');
        this.confidenceValue = document.getElementById('confidence-value');
        this.sentenceOutput = document.getElementById('sentence-output');
    }

    // Initialize output displays
    initialize() {
        console.log('Output manager initialized');
        this.resetDisplay();
    }

    // Update prediction display
    updatePrediction(symbol, confidence) {
        if (this.predictionSymbol) {
            this.predictionSymbol.textContent = symbol;
        }

        // Update confidence in In-Depth mode
        if (learningMode.isEnabled('showConfidence') && this.confidenceValue) {
            const percentage = Math.round(confidence * 100);
            this.confidenceValue.textContent = `${percentage}%`;
        }
    }

    // Add word to sentence
    addToSentence(word) {
        if (!this.sentenceOutput) return;

        // Remove empty state if present
        const emptyState = this.sentenceOutput.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        // Get current sentence
        const currentText = this.sentenceOutput.textContent.trim();

        // Add word with space
        if (currentText === '' || currentText === 'Gestures will appear here...') {
            this.sentenceOutput.textContent = word;
        } else {
            this.sentenceOutput.textContent = currentText + ' ' + word;
        }
    }

    // Clear sentence
    clearSentence() {
        if (this.sentenceOutput) {
            this.sentenceOutput.innerHTML = '<p class="empty-state">Gestures will appear here...</p>';
        }
    }

    // Get current sentence
    getCurrentSentence() {
        if (!this.sentenceOutput) return '';
        
        const text = this.sentenceOutput.textContent.trim();
        return text === 'Gestures will appear here...' ? '' : text;
    }

    // Reset all displays
    resetDisplay() {
        if (this.predictionSymbol) {
            this.predictionSymbol.textContent = '—';
        }

        if (this.confidenceValue) {
            this.confidenceValue.textContent = '0%';
        }

        this.clearSentence();
    }

    // Export sentence (future feature)
    exportSentence() {
        const sentence = this.getCurrentSentence();
        
        if (!sentence) {
            alert('No sentence to export');
            return;
        }

        // Copy to clipboard
        navigator.clipboard.writeText(sentence).then(() => {
            alert('Sentence copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Could not copy sentence');
        });
    }
}

// Global output instance
const output = new OutputManager();