class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.silentChunks = 0;
    this.maxSilentChunks = 10;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || !input[0]) {
      return true;
    }

    const inputData = input[0];

    // Calculate RMS
    let rms = 0;
    for (let i = 0; i < inputData.length; i++) {
      rms += inputData[i] * inputData[i];
    }
    rms = Math.sqrt(rms / inputData.length);

    // Convert to Int16
    const int16Array = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      int16Array[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
    }

    // Check for meaningful audio
    const hasAudio = rms > 0.005;
    const hasMeaningfulSamples = int16Array.some(
      (sample) => Math.abs(sample) > 50
    );

    if (hasAudio && hasMeaningfulSamples) {
      this.silentChunks = 0;

      // Send audio data to main thread
      this.port.postMessage({
        audioData: Array.from(int16Array),
        rms: rms,
        hasAudio: true,
      });
    } else {
      this.silentChunks++;

      // Only send silent chunks occasionally to maintain timing
      if (this.silentChunks <= this.maxSilentChunks) {
        this.port.postMessage({
          audioData: [],
          rms: rms,
          hasAudio: false,
        });
      }
    }

    // Pass through audio to output (for monitoring)
    for (let i = 0; i < inputData.length; i++) {
      output[0][i] = inputData[i];
    }

    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
