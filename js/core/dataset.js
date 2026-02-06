// ===================================
// DATASET MODULE
// ===================================
// Manages sample collection and storage

class DatasetManager {
    constructor() {
        this.dataset = {};  // { label: [[features], [features], ...] }
        this.currentLabel = '';
    }

    // Set current label for recording
    setLabel(label) {
        this.currentLabel = label.trim();
        
        // Initialize label in dataset if it doesn't exist
        if (this.currentLabel && !this.dataset[this.currentLabel]) {
            this.dataset[this.currentLabel] = [];
        }
    }

    // Add a sample to the dataset
    addSample(landmarks) {
        if (!this.currentLabel) {
            console.warn('No label set for recording');
            return false;
        }

        if (!landmarks) {
            console.warn('No landmarks provided');
            return false;
        }

        // Extract features from landmarks
        const features = handTracker.extractFeatures(landmarks);
        
        if (!features) {
            console.warn('Failed to extract features');
            return false;
        }

        // Add to dataset
        this.dataset[this.currentLabel].push(features);
        
        console.log(`Sample added to "${this.currentLabel}": ${this.getSampleCount(this.currentLabel)} total`);
        
        return true;
    }

    // Get sample count for a label
    getSampleCount(label) {
        return this.dataset[label] ? this.dataset[label].length : 0;
    }

    // Get total sample count across all labels
    getTotalSamples() {
        let total = 0;
        Object.values(this.dataset).forEach(samples => {
            total += samples.length;
        });
        return total;
    }

    // Get all labels
    getLabels() {
        return Object.keys(this.dataset);
    }

    // Get dataset for a specific label
    getLabelData(label) {
        return this.dataset[label] || [];
    }

    // Get entire dataset
    getDataset() {
        return this.dataset;
    }

    // Check if dataset is ready for training
    isReadyForTraining() {
        const labels = this.getLabels();
        
        // Need at least 2 labels
        if (labels.length < 2) {
            return false;
        }

        // Each label needs at least 5 samples
        for (let label of labels) {
            if (this.getSampleCount(label) < 5) {
                return false;
            }
        }

        return true;
    }

    // Get training readiness message
    getReadinessMessage() {
        const labels = this.getLabels();
        
        if (labels.length === 0) {
            return 'No data collected yet';
        }

        if (labels.length < 2) {
            return `Need at least 2 symbols (you have ${labels.length})`;
        }

        for (let label of labels) {
            const count = this.getSampleCount(label);
            if (count < 5) {
                return `"${label}" needs more samples (${count}/5 minimum)`;
            }
        }

        return 'Ready to train!';
    }

    // Export dataset as JSON
    exportDataset() {
        const dataStr = JSON.stringify(this.dataset, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gesture-dataset-${Date.now()}.json`;
        link.click();
        
        console.log('Dataset exported successfully');
    }

    // Import dataset from JSON
    importDataset(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            this.dataset = imported;
            console.log('Dataset imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import dataset:', error);
            return false;
        }
    }

    // Reset dataset
    reset() {
        this.dataset = {};
        this.currentLabel = '';
        console.log('Dataset reset');
    }

    // Get dataset summary for display
    getSummary() {
        const summary = [];
        
        for (let label of this.getLabels()) {
            summary.push({
                label: label,
                count: this.getSampleCount(label)
            });
        }

        // Sort by label name
        summary.sort((a, b) => a.label.localeCompare(b.label));
        
        return summary;
    }

    // Delete last sample from a label (In-Depth mode)
    deleteLastSample(label) {
        if (!this.dataset[label] || this.dataset[label].length === 0) {
            console.warn(`No samples to delete for label: ${label}`);
            return false;
        }

        this.dataset[label].pop();
        console.log(`Deleted last sample from "${label}": ${this.getSampleCount(label)} remaining`);
        
        // Remove label if no samples left
        if (this.dataset[label].length === 0) {
            delete this.dataset[label];
            console.log(`Label "${label}" removed (no samples remaining)`);
        }
        
        return true;
    }

    // Clear all samples for a specific label (In-Depth mode)
    clearLabel(label) {
        if (!this.dataset[label]) {
            console.warn(`Label does not exist: ${label}`);
            return false;
        }

        const count = this.getSampleCount(label);
        delete this.dataset[label];
        console.log(`Cleared label "${label}" (${count} samples removed)`);
        
        return true;
    }

    // Check if dataset is balanced
    isBalanced() {
        const labels = this.getLabels();
        if (labels.length < 2) return true;

        const counts = labels.map(label => this.getSampleCount(label));
        const maxCount = Math.max(...counts);
        const minCount = Math.min(...counts);

        // Consider balanced if difference is less than 50%
        return (maxCount - minCount) / maxCount < 0.5;
    }

    // Get imbalance warnings
    getImbalanceWarnings() {
        const warnings = [];
        const labels = this.getLabels();

        if (labels.length < 2) return warnings;

        const counts = labels.map(label => ({
            label: label,
            count: this.getSampleCount(label)
        }));

        const avgCount = counts.reduce((sum, item) => sum + item.count, 0) / counts.length;

        counts.forEach(item => {
            if (item.count < avgCount * 0.6) {
                warnings.push({
                    label: item.label,
                    count: item.count,
                    message: `Low data - consider adding more samples`
                });
            }
        });

        return warnings;
    }
}

// Global dataset instance
const dataset = new DatasetManager();