import * as tf from '@tensorflow/tfjs';
import { ScenarioDataset, TrainingMetrics, EpochLog, PredictionResult } from '../types/scenario';

// Store trained models in-memory for fast switching
const trainedModelsCache = new Map<string, tf.LayersModel>();

export class TFModelService {
  /**
   * Builds and compiles a tailored dense neural network for tabular data
   */
  public static createModel(inputDim: number, outputDim: number): tf.LayersModel {
    const model = tf.sequential();

    // Hidden layer 1
    model.add(
      tf.layers.dense({
        inputShape: [inputDim],
        units: Math.max(16, inputDim * 3),
        activation: 'relu',
        kernelInitializer: 'glorotNormal'
      })
    );

    // Regularization
    model.add(tf.layers.dropout({ rate: 0.1 }));

    // Hidden layer 2
    model.add(
      tf.layers.dense({
        units: Math.max(8, Math.round(inputDim * 1.5)),
        activation: 'relu',
        kernelInitializer: 'glorotNormal'
      })
    );

    // Output classification layer (Softmax for categorical probabilities)
    model.add(
      tf.layers.dense({
        units: outputDim,
        activation: 'softmax',
        kernelInitializer: 'glorotNormal'
      })
    );

    // Compile with Adam and Categorical Crossentropy
    model.compile({
      optimizer: tf.train.adam(0.015),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Trains the model using the 100 samples in real-time, calling back on every epoch
   */
  public static async trainScenarioModel(
    dataset: ScenarioDataset,
    epochs: number = 25,
    onProgress?: (metrics: TrainingMetrics) => void
  ): Promise<tf.LayersModel> {
    const startTime = performance.now();
    const inputDim = dataset.features.length;
    const outputDim = dataset.outputClasses.length;

    // Dispose previously cached model if exists
    if (trainedModelsCache.has(dataset.scenarioId)) {
      const oldModel = trainedModelsCache.get(dataset.scenarioId);
      oldModel?.dispose();
      trainedModelsCache.delete(dataset.scenarioId);
    }

    const model = this.createModel(inputDim, outputDim);
    trainedModelsCache.set(dataset.scenarioId, model);

    // Prepare tensors from the 100 normalized cases
    const inputXsData = dataset.samples.map((s) => s.inputXs);
    const labelYsData = dataset.samples.map((s) => s.tensorLabels);

    const xs = tf.tensor2d(inputXsData, [dataset.samples.length, inputDim]);
    const ys = tf.tensor2d(labelYsData, [dataset.samples.length, outputDim]);

    const history: EpochLog[] = [];

    // Notify initial state
    onProgress?.({
      status: 'training',
      currentEpoch: 0,
      totalEpochs: epochs,
      currentLoss: 0,
      currentAccuracy: 0,
      history: [],
      trainingDurationMs: 0
    });

    try {
      await model.fit(xs, ys, {
        epochs,
        batchSize: 8,
        shuffle: true,
        validationSplit: 0.2, // 80 train, 20 test validation
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            const loss = logs?.loss ?? 0;
            const accuracy = logs?.acc ?? logs?.accuracy ?? 0;
            const valLoss = logs?.val_loss;
            const valAccuracy = logs?.val_acc ?? logs?.val_accuracy;

            const epochLog: EpochLog = {
              epoch: epoch + 1,
              loss: Number(loss.toFixed(4)),
              accuracy: Number((accuracy * 100).toFixed(1)),
              valLoss: valLoss !== undefined ? Number(valLoss.toFixed(4)) : undefined,
              valAccuracy: valAccuracy !== undefined ? Number((valAccuracy * 100).toFixed(1)) : undefined
            };

            history.push(epochLog);

            onProgress?.({
              status: 'training',
              currentEpoch: epoch + 1,
              totalEpochs: epochs,
              currentLoss: epochLog.loss,
              currentAccuracy: epochLog.accuracy,
              history: [...history],
              trainingDurationMs: Math.round(performance.now() - startTime)
            });

            // Yield to browser render loop so UI updates smoothly
            await tf.nextFrame();
          }
        }
      });

      const totalDuration = Math.round(performance.now() - startTime);
      const lastLog = history[history.length - 1];

      onProgress?.({
        status: 'completed',
        currentEpoch: epochs,
        totalEpochs: epochs,
        currentLoss: lastLog ? lastLog.loss : 0,
        currentAccuracy: lastLog ? lastLog.accuracy : 100,
        history,
        trainingDurationMs: totalDuration
      });

      return model;
    } catch (err: any) {
      console.error('Error during model training:', err);
      onProgress?.({
        status: 'error',
        currentEpoch: 0,
        totalEpochs: epochs,
        currentLoss: 0,
        currentAccuracy: 0,
        history,
        trainingDurationMs: Math.round(performance.now() - startTime),
        errorMessage: err?.message || 'Falha desconhecida no treinamento.'
      });
      throw err;
    } finally {
      // Memory cleanup: dispose input & target tensors
      xs.dispose();
      ys.dispose();
    }
  }

  /**
   * Run inference on normalized input vector
   */
  public static predict(
    scenarioId: string,
    dataset: ScenarioDataset,
    normalizedInputs: number[]
  ): PredictionResult {
    const model = trainedModelsCache.get(scenarioId);
    if (!model) {
      throw new Error(`Modelo para o cenário "${scenarioId}" ainda não foi treinado.`);
    }

    const tStart = performance.now();

    const probabilities: number[] = tf.tidy(() => {
      const inputTensor = tf.tensor2d([normalizedInputs], [1, normalizedInputs.length]);
      const pred = model.predict(inputTensor) as tf.Tensor;
      return Array.from(pred.dataSync());
    });

    const executionTimeMs = Math.round((performance.now() - tStart) * 10) / 10;

    let maxIndex = 0;
    let maxVal = -1;

    const mapped = probabilities.map((prob, idx) => {
      if (prob > maxVal) {
        maxVal = prob;
        maxIndex = idx;
      }
      return {
        classDef: dataset.outputClasses[idx],
        probability: prob,
        percentage: `${(prob * 100).toFixed(1)}%`
      };
    });

    return {
      probabilities: mapped,
      bestClass: dataset.outputClasses[maxIndex],
      confidence: Math.round(maxVal * 1000) / 10,
      executionTimeMs
    };
  }

  /**
   * Check if a model is currently trained and cached in memory
   */
  public static hasTrainedModel(scenarioId: string): boolean {
    return trainedModelsCache.has(scenarioId);
  }

  /**
   * Get active TensorFlow Backend information
   */
  public static getBackendInfo(): { backend: string; tensorCount: number; memoryMB: number } {
    const mem = tf.memory();
    return {
      backend: tf.getBackend(),
      tensorCount: mem.numTensors,
      memoryMB: Math.round((mem.numBytes / (1024 * 1024)) * 100) / 100
    };
  }
}
