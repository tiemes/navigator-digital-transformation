<!--
  VoiceButton.svelte — Microphone button with recording state.
  Uses MediaRecorder API to capture audio, sends to /api/transcribe.
  Returns transcribed text via ontranscript callback.

  Props: disabled, ontranscript(text)
  Used by: ChatInput.svelte
-->
<script>
  import { t } from '$lib/i18n';
  import { transcribe } from '$lib/api.js';

  let { disabled = false, ontranscript } = $props();

  let recording = $state(false);
  let mediaRecorder = $state(null);
  let error = $state('');

  async function toggleRecording() {
    if (recording) {
      mediaRecorder?.stop();
      return;
    }

    error = '';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      const chunks = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        recording = false;
        mediaRecorder = null;

        const blob = new Blob(chunks, { type: 'audio/webm' });
        try {
          const text = await transcribe(blob);
          if (text) ontranscript?.(text);
        } catch (e) {
          error = e.message;
          console.error('Transcription error:', e);
        }
      };

      recorder.start();
      mediaRecorder = recorder;
      recording = true;
    } catch (e) {
      error = e.message;
      console.error('Microphone error:', e);
    }
  }
</script>

<button
  class="mic-btn"
  class:recording
  onclick={toggleRecording}
  {disabled}
  title={recording ? 'Stop' : $t('chat.speak')}
  aria-label={recording ? 'Stop recording' : 'Start recording'}
>
  {#if recording}
    <span class="icon">&#9724;</span>
  {:else}
    <span class="icon">&#127908;</span>
  {/if}
</button>

{#if error}
  <span class="error" title={error}>!</span>
{/if}

<style>
  .mic-btn {
    width: 44px;
    height: 44px;
    border: 1px solid #e8e8e8;
    border-radius: 50%;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 18px;
    transition: all 0.15s;
  }
  .mic-btn:hover:not(:disabled) { background: #f0f0f0; }
  .mic-btn.recording {
    background: #e74c3c;
    border-color: #e74c3c;
    color: #fff;
    animation: pulse 1.5s infinite;
  }
  .mic-btn:disabled { opacity: 0.4; }
  .icon { line-height: 1; }
  .error {
    color: #e74c3c;
    font-size: 12px;
    font-weight: bold;
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(231, 76, 60, 0); }
  }
</style>
