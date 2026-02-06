// ===================================
// TRAINER MODULE
// ===================================
// TensorFlow.js model training

class ModelTrainer {
    constructor() {
        this.model = null;
        this.labelEncoder = {};  // Maps labels to indices
        this.labelDecoder = {};  // Maps indices to labels
        this.isTrained = false;
        this.isTraining = false;
    }

    // Build neural network model
    buildModel(inputSize, numClasses) {
        const model = tf.sequential();

        // Input layer + First hidden layer
        model.add(tf.layers.dense({
            inputShape: [inputSize],
            units: 64,
            activation: 'relu'
        }));

        model.add(tf.layers.dropout({ rate: 0.2 }));

        // Second hidden layer
        model.add(tf.layers.dense({
            units: 32,
            activation: 'relu'
        }));

        model.add(tf.layers.dropout({ rate: 0.2 }));

        // Output layer
        model.add(tf.layers.dense({
            units: numClasses,
            activation: 'softmax'
        }));

        // Compile model
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        console.log('Model architecture:');
        model.summary();

        return model;
    }

    // Prepare training data
    prepareData(datasetObj) {
        const labels = Object.keys(datasetObj);
        const allFeatures = [];
        const allLabels = [];

        // Create label encoding
        labels.forEach((label, index) => {
            this.labelEncoder[label] = index;
            this.labelDecoder[index] = label;
        });

        // Collect all samples
        labels.forEach(label => {
            const samples = datasetObj[label];
            samples.forEach(features => {
                allFeatures.push(features);
                allLabels.push(this.labelEncoder[label]);
            });
        });

        // Convert to tensors
        const xs = tf.tensor2d(allFeatures);
        const ys = tf.oneHot(tf.tensor1d(allLabels, 'int32'), labels.length);

        return { xs, ys, numClasses: labels.length, inputSize: allFeatures[0].length };
    }

    // Train the model
    async train(datasetObj, onProgress) {
        if (this.isTraining) {
            console.warn('Training already in progress');
            return false;
        }

        this.isTraining = true;
        console.log('Starting training...');

        try {
            // Prepare data
            const { xs, ys, numClasses, inputSize } = this.prepareData(datasetObj);

            // Build model
            this.model = this.buildModel(inputSize, numClasses);

            // Training parameters
            const epochs = 50;
            const batchSize = 32;

            // Train model with detailed progress
            await this.model.fit(xs, ys, {
                epochs: epochs,
                batchSize: batchSize,
                shuffle: true,
                validationSplit: 0.2,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        if (onProgress) {
                            onProgress({
                                epoch: epoch + 1,
                                totalEpochs: epochs,
                                loss: logs.loss,
                                accuracy: logs.acc,
                                valLoss: logs.val_loss,
                                valAccuracy: logs.val_acc
                            });
                        }
                    }
                }
            });

            // Clean up tensors
            xs.dispose();
            ys.dispose();

            this.isTrained = true;
            this.isTraining = false;

            console.log('Training complete!');
            return true;

        } catch (error) {
            console.error('Training failed:', error);
            this.isTraining = false;
            return false;
        }
    }

    // Make prediction
    predict(features) {
        if (!this.isTrained || !this.model) {
            return null;
        }

        try {
            // Convert features to tensor
            const inputTensor = tf.tensor2d([features]);

            // Make prediction
            const prediction = this.model.predict(inputTensor);
            const probabilities = prediction.dataSync();

            // Get highest probability
            let maxProb = 0;
            let predictedIndex = 0;

            for (let i = 0; i < probabilities.length; i++) {
                if (probabilities[i] > maxProb) {
                    maxProb = probabilities[i];
                    predictedIndex = i;
                }
            }

            // Clean up
            inputTensor.dispose();
            prediction.dispose();

            return {
                label: this.labelDecoder[predictedIndex],
                confidence: maxProb,
                probabilities: Array.from(probabilities)
            };

        } catch (error) {
            console.error('Prediction failed:', error);
            return null;
        }
    }

    // Check if model is trained
    isTrained() {
        return this.isTrained;
    }

    // Check if currently training
    isCurrentlyTraining() {
        return this.isTraining;
    }

    // Get model info
    getModelInfo() {
        if (!this.model) {
            return null;
        }

        return {
            labels: Object.keys(this.labelEncoder),
            numClasses: Object.keys(this.labelEncoder).length,
            isTrained: this.isTrained
        };
    }

    // Reset model
    reset() {
        if (this.model) {
            this.model.dispose();
            this.model = null;
        }
        
        this.labelEncoder = {};
        this.labelDecoder = {};
        this.isTrained = false;
        this.isTraining = false;
        
        console.log('Model reset');
    }
}

// Global trainer instance
const trainer = new ModelTrainer();