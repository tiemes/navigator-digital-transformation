<!--
  VoiceButton.svelte — Voice recording button.
  Uses MediaRecorder API to capture audio, sends to /api/transcribe,
  returns text via ontranscript callback. Always calls onsend after a
  successful transcription so click-to-stop also submits in one action.

  Props:
    disabled — disables the button
    ontranscript(text) — called with transcribed text
    onsend() — called after successful transcription (click-end-and-send)
    autoSend — if true, a silence detector also auto-stops after ~1.5s
               of silence (default: false; user can enable in settings)
    large — render as large primary CTA (default: false)

  Used by: ChatInput, BarrierVision, BarrierReflect
-->
<script>
  import { t } from '$lib/i18n';
  import { transcribe } from '$lib/api.js';
  import { createSilenceDetector } from './SilenceDetector.js';

  let {
    disabled = false,
    ontranscript,
    onsend,
    autoSend = false,
    large = false,
  } = $props();

  let recording = $state(false);
  let transcribing = $state(false);
  let mediaRecorder = $state(null);
  let silenceDetector = $state(null);
  let error = $state('');
  let audioLevel = $state(0);
  let levelAnimId = $state(null);

  function stopLevelMonitor() {
    if (levelAnimId) {
      cancelAnimationFrame(levelAnimId);
      levelAnimId = null;
    }
    audioLevel = 0;
  }

  function startLevelMonitor() {
    function update() {
      if (silenceDetector) {
        audioLevel = Math.min(silenceDetector.getLevel() * 10, 1);
      }
      levelAnimId = requestAnimationFrame(update);
    }
    update();
  }

  async function toggleRecording() {
    if (recording) {
      mediaRecorder?.stop();
      silenceDetector?.stop();
      silenceDetector = null;
      stopLevelMonitor();
      return;
    }

    error = '';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      const chunks = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        recording = false;
        mediaRecorder = null;
        stopLevelMonitor();

        if (chunks.length === 0) return;

        const blob = new Blob(chunks, { type: 'audio/webm' });
        transcribing = true;
        try {
          const text = await transcribe(blob);
          if (text) {
            ontranscript?.(text);
            onsend?.();
          }
        } catch (err) {
          error = err.message;
          console.error('Transcription error:', err);
        } finally {
          transcribing = false;
        }
      };

      // Silence detection is opt-in (autoSend). Default: user clicks to stop.
      if (autoSend) {
        silenceDetector = createSilenceDetector(stream, {
          silenceThreshold: 0.008,
          silenceDuration: 1500,
          onSilence: () => {
            if (recording) {
              mediaRecorder?.stop();
              silenceDetector?.stop();
              silenceDetector = null;
            }
          },
        });
      }

      recorder.start();
      mediaRecorder = recorder;
      recording = true;
      startLevelMonitor();
    } catch (err) {
      error = err.message;
      console.error('Microphone error:', err);
    }
  }

  /** Programmatically start recording (used by auto-mic after TTS) */
  export function startRecording() {
    if (!recording && !disabled) {
      toggleRecording();
    }
  }

  const ringSize = $derived(large ? 96 : 48);
  const ringScale = $derived(1 + audioLevel * 0.4);
</script>

<div class="voice-container" class:large>
  <button
    class="mic-btn"
    class:recording
    class:transcribing
    class:large
    onclick={toggleRecording}
    disabled={disabled || transcribing}
    title={recording ? 'Stop' : $t('chat.speak')}
    aria-label={recording ? 'Stop recording' : 'Start recording'}
  >
    {#if recording}
      <span
        class="level-ring"
        style="width: {ringSize}px; height: {ringSize}px; transform: scale({ringScale})"
      ></span>
      <span class="icon stop-icon">■</span>
    {:else if transcribing}
      <span class="icon">⏳</span>
    {:else}
      <span class="icon mic-icon">🎤</span>
    {/if}
  </button>

  {#if large && !recording && !transcribing}
    <span class="hint">{$t('chat.speak')}</span>
  {/if}

  {#if error}
    <span class="error" title={error}>!</span>
  {/if}
</div>

<style>
  .voice-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    position: relative;
  }
  .mic-btn {
    position: relative;
    width: 48px;
    height: 48px;
    border: 2px solid #e0e0e0;
    border-radius: 50%;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s;
    overflow: visible;
  }
  .mic-btn.large {
    width: 96px;
    height: 96px;
    font-size: 36px;
    border-width: 3px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }
  .mic-btn:hover:not(:disabled) {
    border-color: var(--text);
    background: #f8f8f8;
  }
  .mic-btn.recording {
    background: #e74c3c;
    border-color: #e74c3c;
    color: #fff;
  }
  .mic-btn.transcribing {
    opacity: 0.7;
    cursor: wait;
  }
  .mic-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .level-ring {
    position: absolute;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4);
    transition: transform 0.05s;
    pointer-events: none;
  }
  .icon {
    position: relative;
    z-index: 1;
    line-height: 1;
  }
  .stop-icon { font-size: 14px; }
  .mic-btn.large .stop-icon { font-size: 24px; }
  .hint {
    font-size: 13px;
    color: var(--text-light);
    font-weight: 500;
  }
  .error {
    color: #e74c3c;
    font-size: 12px;
    font-weight: bold;
  }
</style>
