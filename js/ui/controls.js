// ===================================
// CONTROLS MODULE
// ===================================
// Manages button interactions and user inputs

class ControlsManager {
    constructor() {
        this.recordButton = document.getElementById('btn-record');
        this.trainButton = document.getElementById('btn-train');
        this.retrainButton = document.getElementById('btn-retrain');
        this.exportButton = document.getElementById('btn-export');
        this.resetButton = document.getElementById('btn-reset');
        this.clearSentenceButton = document.getElementById('btn-clear-sentence');
        this.symbolInput = document.getElementById('symbol-name');
        this.sampleCounter = document.getElementById('sample-counter');
        this.trainingStatus = document.getElementById('training-status');
    }

    // Initialize all controls
    initialize() {
        this.setupRecordButton();
        this.setupTrainButton();
        this.setupRetrainButton();
        this.setupExportButton();
        this.setupResetButton();
        this.setupClearSentenceButton();
        this.setupSymbolInput();
        
        console.log('Controls initialized');
    }

    // Setup record button
    setupRecordButton() {
        this.recordButton.addEventListener('click', () => {
            const landmarks = handTracker.getLandmarks();
            
            if (!landmarks) {
                alert('No hand detected. Please show your hand to the camera.');
                return;
            }

            const label = this.symbolInput.value.trim();
            
            if (!label) {
                alert('Please enter a symbol name first.');
                this.symbolInput.focus();
                return;
            }

            // Set label and add sample
            dataset.setLabel(label);
            const success = dataset.addSample(landmarks);

            if (success) {
                this.updateSampleCounter();
                this.checkTrainingReadiness();
                this.updateDatasetViewer();
                
                // Visual feedback
                this.flashButton(this.recordButton);
            }
        });
    }

    // Setup train button
    setupTrainButton() {
        this.trainButton.addEventListener('click', async () => {
            if (!dataset.isReadyForTraining()) {
                alert(dataset.getReadinessMessage());
                return;
            }

            // Disable buttons during training
            this.trainButton.disabled = true;
            this.recordButton.disabled = true;
            
            this.updateTrainingStatus('Training model...', false);

            // Train model with progress callback
            const success = await trainer.train(
                dataset.getDataset(),
                (progress) => {
                    // Show detailed progress in In-Depth mode
                    if (learningMode.isEnabled('showTrainingProgress')) {
                        const statusText = `Epoch ${progress.epoch}/${progress.totalEpochs} – Loss: ${progress.loss.toFixed(4)}`;
                        this.updateTrainingStatus(statusText, false);
                    } else {
                        // Simple progress in Normal mode
                        const percent = Math.round((progress.epoch / progress.totalEpochs) * 100);
                        this.updateTrainingStatus(`Training... ${percent}%`, false);
                    }
                }
            );

            if (success) {
                const message = learningMode.isEnabled('friendlyLanguage')
                    ? 'Training complete! Try making gestures.'
                    : 'Model training complete. Begin gesture recognition.';
                
                this.updateTrainingStatus(message, true);
                
                // Enable prediction
                predictor.start();
                
                // Enable retrain and export in In-Depth mode
                if (learningMode.isEnabled('enableRetrain')) {
                    this.retrainButton.disabled = false;
                }
                if (learningMode.isEnabled('enableExport')) {
                    this.exportButton.disabled = false;
                }
            } else {
                this.updateTrainingStatus('Training failed. Please try again.', false);
            }

            // Re-enable buttons
            this.trainButton.disabled = false;
            this.recordButton.disabled = false;
        });
    }

    // Setup retrain button (In-Depth mode only)
    setupRetrainButton() {
        if (!this.retrainButton) return;

        this.retrainButton.addEventListener('click', async () => {
            if (!confirm('Retrain the model with current data?')) return;

            predictor.stop();
            trainer.reset();
            
            // Trigger training
            this.trainButton.click();
        });
    }

    // Setup export button (In-Depth mode only)
    setupExportButton() {
        if (!this.exportButton) return;

        this.exportButton.addEventListener('click', () => {
            dataset.exportDataset();
        });
    }

    // Setup reset button
    setupResetButton() {
        this.resetButton.addEventListener('click', () => {
            if (!confirm('This will delete ALL collected data and reset the model. Continue?')) {
                return;
            }

            // Reset everything
            dataset.reset();
            trainer.reset();
            predictor.stop();
            predictor.clearSentence();

            // Reset UI
            this.symbolInput.value = '';
            this.updateSampleCounter();
            this.updateTrainingStatus('', false);
            this.updateDatasetViewer();
            this.checkTrainingReadiness();

            // Disable advanced buttons
            if (this.retrainButton) this.retrainButton.disabled = true;
            if (this.exportButton) this.exportButton.disabled = true;

            console.log('Everything reset');
        });
    }

    // Setup clear sentence button
    setupClearSentenceButton() {
        this.clearSentenceButton.addEventListener('click', () => {
            predictor.clearSentence();
        });
    }

    // Setup symbol input
    setupSymbolInput() {
        // Enable record button when input has value
        this.symbolInput.addEventListener('input', () => {
            const hasValue = this.symbolInput.value.trim().length > 0;
            const handDetected = handTracker.isHandDetected();
            
            this.recordButton.disabled = !(hasValue && handDetected);
        });

        // Record on Enter key
        this.symbolInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.recordButton.click();
            }
        });
    }

    // Update sample counter
    updateSampleCounter() {
        const total = dataset.getTotalSamples();
        const text = learningMode.isEnabled('showSampleCounts')
            ? `${total} samples collected`
            : `${total} samples`;
        
        this.sampleCounter.textContent = text;
    }

    // Update training status
    updateTrainingStatus(message, isSuccess) {
        this.trainingStatus.textContent = message;
        this.trainingStatus.classList.toggle('success', isSuccess);
        this.trainingStatus.classList.toggle('error', !isSuccess && message.includes('failed'));
    }

    // Check if ready for training
    checkTrainingReadiness() {
        const isReady = dataset.isReadyForTraining();
        this.trainButton.disabled = !isReady;

        // Show readiness message in Normal mode
        if (!learningMode.isEnabled('showDetailedStatus')) {
            if (!isReady && dataset.getTotalSamples() > 0) {
                this.updateTrainingStatus(dataset.getReadinessMessage(), false);
            }
        }
    }

    // Update dataset viewer (In-Depth mode only)
    updateDatasetViewer() {
        if (!learningMode.isEnabled('showDatasetViewer')) return;

        const datasetList = document.getElementById('dataset-list');
        if (!datasetList) return;

        const summary = dataset.getSummary();
        const warnings = dataset.getImbalanceWarnings();

        if (summary.length === 0) {
            datasetList.innerHTML = '<p class="empty-state">No data collected yet</p>';
            return;
        }

        // Build dataset items with warning indicators
        let html = '';
        summary.forEach(item => {
            const warning = warnings.find(w => w.label === item.label);
            const warningIcon = warning ? ' ⚠️' : '';
            const warningClass = warning ? 'dataset-item-warning' : '';
            
            html += `
                <div class="dataset-item ${warningClass}">
                    <div class="dataset-item-info">
                        <span class="dataset-item-name">${item.label}${warningIcon}</span>
                        <span class="dataset-item-count">${item.count} samples</span>
                    </div>
                    ${learningMode.isEnabled('enableSampleDeletion') ? `
                        <div class="dataset-item-actions">
                            <button class="btn-mini" onclick="controls.deleteLastSample('${item.label}')">Delete Last</button>
                            <button class="btn-mini btn-danger-mini" onclick="controls.clearLabel('${item.label}')">Clear All</button>
                        </div>
                    ` : ''}
                </div>
                ${warning ? `<div class="dataset-warning">${warning.message}</div>` : ''}
            `;
        });

        datasetList.innerHTML = html;
    }

    // Delete last sample from a label (In-Depth mode)
    deleteLastSample(label) {
        if (!learningMode.isEnabled('enableSampleDeletion')) return;

        if (confirm(`Delete the last sample from "${label}"?`)) {
            const success = dataset.deleteLastSample(label);
            
            if (success) {
                this.updateSampleCounter();
                this.updateDatasetViewer();
                this.checkTrainingReadiness();
            }
        }
    }

    // Clear all samples for a label (In-Depth mode)
    clearLabel(label) {
        if (!learningMode.isEnabled('enableSampleDeletion')) return;

        if (confirm(`Delete ALL samples for "${label}"? This cannot be undone.`)) {
            const success = dataset.clearLabel(label);
            
            if (success) {
                this.updateSampleCounter();
                this.updateDatasetViewer();
                this.checkTrainingReadiness();
            }
        }
    }

    // Visual feedback for button press
    flashButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    }

    // Enable/disable record button based on hand detection
    updateRecordButtonState(handDetected) {
        const hasLabel = this.symbolInput.value.trim().length > 0;
        this.recordButton.disabled = !(hasLabel && handDetected);
    }
}

// Global controls instance
const controls = new ControlsManager();