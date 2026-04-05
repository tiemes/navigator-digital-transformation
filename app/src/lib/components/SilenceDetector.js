/**
 * SilenceDetector.js — Detects silence in a MediaStream using Web Audio API.
 * Uses AnalyserNode to monitor audio levels. When RMS volume stays below
 * threshold for the configured duration, calls the onSilence callback.
 *
 * Used by: VoiceButton.svelte for auto-stop on silence
 */

/**
 * Create a silence detector for a media stream.
 * @param {MediaStream} stream - Audio stream from getUserMedia
 * @param {Object} options
 * @param {number} options.silenceThreshold - RMS below this = silence (default 0.01)
 * @param {number} options.silenceDuration - ms of silence before triggering (default 1500)
 * @param {function} options.onSilence - called when silence detected
 * @param {function} options.onSound - called when sound resumes after silence
 * @returns {{ stop: function, getLevel: function }} cleanup + level getter
 */
export function createSilenceDetector(stream, options = {}) {
  const {
    silenceThreshold = 0.01,
    silenceDuration = 1500,
    onSilence = () => {},
    onSound = () => {},
  } = options;

  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);

  const dataArray = new Float32Array(analyser.fftSize);
  let silenceStart = null;
  let silenceTriggered = false;
  let animId = null;

  function getRMS() {
    analyser.getFloatTimeDomainData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    return Math.sqrt(sum / dataArray.length);
  }

  function check() {
    const level = getRMS();

    if (level < silenceThreshold) {
      if (silenceStart === null) {
        silenceStart = Date.now();
      } else if (!silenceTriggered && Date.now() - silenceStart > silenceDuration) {
        silenceTriggered = true;
        onSilence();
      }
    } else {
      if (silenceTriggered) {
        onSound();
      }
      silenceStart = null;
      silenceTriggered = false;
    }

    animId = requestAnimationFrame(check);
  }

  check();

  return {
    stop() {
      if (animId) cancelAnimationFrame(animId);
      source.disconnect();
      audioCtx.close();
    },
    getLevel() {
      return getRMS();
    },
  };
}
