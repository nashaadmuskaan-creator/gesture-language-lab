// ===================================
// PANELS MODULE
// ===================================
// Manages panel visibility and layout based on mode

class PanelsManager {
    constructor() {
        this.cameraPanel = document.querySelector('.panel-camera');
        this.controlsPanel = document.querySelector('.panel-controls');
        this.outputPanel = document.querySelector('.panel-output');
    }

    // Initialize panels based on current mode
    initialize() {
        console.log('Initializing panels for mode:', learningMode.getMode());
        
        // Mode is already applied by modes.js
        // This method can be used for additional panel-specific setup
        
        this.setupPanelBehaviors();
    }

    // Setup any panel-specific behaviors
    setupPanelBehaviors() {
        // Could add animations, tooltips, or other panel enhancements here
        console.log('Panel behaviors setup complete');
    }

    // Show/hide specific panels (could be used for future features)
    togglePanel(panelName, visible) {
        const panels = {
            camera: this.cameraPanel,
            controls: this.controlsPanel,
            output: this.outputPanel
        };

        const panel = panels[panelName];
        if (panel) {
            panel.classList.toggle('hidden', !visible);
        }
    }

    // Get panel visibility status
    isPanelVisible(panelName) {
        const panels = {
            camera: this.cameraPanel,
            controls: this.controlsPanel,
            output: this.outputPanel
        };

        const panel = panels[panelName];
        return panel ? !panel.classList.contains('hidden') : false;
    }
}

// Global panels instance
const panels = new PanelsManager();