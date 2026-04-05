<!--
  BarrierVision.svelte — Vision input step of the barrier lens flow.
  Shows an open-ended prompt and a large text area for the user's vision.

  Props: onsubmit(text) — called when user submits their vision
  Used by: barriers/+page.svelte
-->
<script>
  import { t } from '$lib/i18n';
  import VoiceButton from './VoiceButton.svelte';

  let { onsubmit } = $props();
  let text = $state('');

  function handleTranscript(transcript) {
    text = text ? `${text} ${transcript}` : transcript;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (text.trim()) {
      onsubmit(text.trim());
    }
  }
</script>

<div class="vision-step">
  <h2>{$t('barriers.visionTitle')}</h2>
  <p class="prompt">{$t('barriers.visionPrompt')}</p>

  <form onsubmit={handleSubmit}>
    <div class="input-row">
      <VoiceButton ontranscript={handleTranscript} />
      <textarea
        bind:value={text}
        placeholder={$t('barriers.visionPlaceholder')}
        rows="6"
      ></textarea>
    </div>
    <button type="submit" class="btn-primary" disabled={!text.trim()}>
      {$t('barriers.continue')}
    </button>
  </form>
</div>

<style>
  .vision-step { text-align: center; }
  h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .prompt {
    font-size: 16px;
    line-height: 1.6;
    color: var(--text);
    max-width: 520px;
    margin: 0 auto 24px;
  }
  .input-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  textarea {
    flex: 1;
    padding: 14px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 15px;
    line-height: 1.5;
    resize: vertical;
    font-family: inherit;
  }
  textarea:focus {
    outline: none;
    border-color: var(--text);
  }
  .btn-primary {
    margin-top: 16px;
    padding: 10px 32px;
    border: none;
    border-radius: 8px;
    background: var(--text);
    color: #fff;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
  }
  .btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
