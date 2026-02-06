// ===================================
// MODE CONFIGURATION SYSTEM
// ===================================
// Controls which features are visible based on learning mode
// Normal Mode (Grades 8-10): Simple, fun, exploratory
// In-Depth Mode (Grades 11-12): Detailed, analytical, data-focused

const ModeConfig = {
    NORMAL: 'normal',
    INDEPTH: 'indepth'
};

// Feature flags for each mode
const ModeFeatures = {
    [ModeConfig.NORMAL]: {
        showDatasetViewer: false,
        showSampleCounts: false,
        showConfidence: false,
        showAdvancedControls: false,
        enableRetrain: false,
        enableExport: false,
        showDetailedStatus: false,
        showTrainingProgress: false,
        showErrorInsights: false,
        enableSampleDeletion: false,
        friendlyLanguage: true
    },
    [ModeConfig.INDEPTH]: {
        showDatasetViewer: true,
        showSampleCounts: true,
        showConfidence: true,
        showAdvancedControls: true,
        enableRetrain: true,
        enableExport: true,
        showDetailedStatus: true,
        showTrainingProgress: true,
        showErrorInsights: true,
        enableSampleDeletion: true,
        friendlyLanguage: false
    }
};

class LearningMode {
    constructor() {
        this.currentMode = this.loadMode();
        this.features = ModeFeatures[this.currentMode];
    }

    // Load mode from localStorage
    loadMode() {
        const savedMode = localStorage.getItem('learningMode');
        
        // Default to normal mode if no mode is set
        if (!savedMode || !ModeConfig[savedMode.toUpperCase()]) {
            console.warn('No valid mode found, defaulting to NORMAL mode');
            return ModeConfig.NORMAL;
        }
        
        console.log(`Loading ${savedMode.toUpperCase()} mode`);
        return savedMode;
    }

    // Get current mode
    getMode() {
        return this.currentMode;
    }

    // Check if a feature is enabled
    isEnabled(featureName) {
        return this.features[featureName] === true;
    }

    // Get mode display name
    getDisplayName() {
        return this.currentMode === ModeConfig.NORMAL 
            ? 'Normal Mode (Grades 8-10)' 
            : 'In-Depth Mode (Grades 11-12)';
    }

    // Apply UI visibility based on mode
    applyModeUI() {
        console.log('Applying mode UI:', this.currentMode);

        // Update mode indicator badge
        const modeIndicator = document.getElementById('mode-indicator');
        if (modeIndicator) {
            modeIndicator.textContent = this.getDisplayName();
            modeIndicator.className = `mode-badge ${this.currentMode}`;
        }

        // Dataset Viewer (In-Depth only)
        const datasetViewer = document.getElementById('dataset-viewer');
        if (datasetViewer) {
            datasetViewer.classList.toggle('hidden', !this.isEnabled('showDatasetViewer'));
        }

        // Confidence Display (In-Depth only)
        const confidenceDisplay = document.getElementById('confidence-display');
        if (confidenceDisplay) {
            confidenceDisplay.classList.toggle('hidden', !this.isEnabled('showConfidence'));
        }

        // Advanced Controls (In-Depth only)
        const advancedControls = document.getElementById('advanced-controls');
        if (advancedControls) {
            advancedControls.classList.toggle('hidden', !this.isEnabled('showAdvancedControls'));
        }

        // Error Insights Panel (In-Depth only)
        const errorInsights = document.getElementById('error-insights');
        if (errorInsights) {
            errorInsights.classList.toggle('hidden', !this.isEnabled('showErrorInsights'));
        }

        console.log('Mode UI applied successfully');
    }
}

// Global mode instance
const learningMode = new LearningMode();