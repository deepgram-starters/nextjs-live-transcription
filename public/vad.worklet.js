/**
 * Replace this with your own VAD implementation.
 */
class BasicVad extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0][0];

    const amplitudeThreshold = 0.15;

    const rms = Math.sqrt(
      input.reduce((acc, sample) => acc + sample * sample, 0) / input.length
    );

    const isVoiceActive = rms > amplitudeThreshold;

    if (isVoiceActive) {
      this.port.postMessage({ voiceActivity: true });
    } else {
      this.port.postMessage({ voiceActivity: false });
    }

    return true;
  }
}

registerProcessor("voice-activity-processor", BasicVad);
