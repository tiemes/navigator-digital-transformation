<!--
  BarrierVision.svelte — Voice-first vision input step.
  Large mic button as primary CTA. Textarea appears as secondary fallback.
  Auto-sends after silence detection or manual submit.

  Props: onsubmit(text) — called when user submits their vision
  Used by: +page.svelte
-->
<script>
  import { t } from '$lib/i18n';
  import VoiceButton from './VoiceButton.svelte';

  let { onsubmit } = $props();
  let text = $state('');
  let showTextarea = $state(false);

  function handleTranscript(transcript) {
    text = text ? `${text} ${transcript}` : transcript;
  }

  function handleAutoSend() {
    if (text.trim()) {
      onsubmit(text.trim());
    }
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

  <div class="voice-area">
    <VoiceButton
      large={true}
      ontranscript={handleTranscript}
      onsend={handleAutoSend}
      autoSend={true}
    />
  </div>

  {#if text && !showTextarea}
    <div class="transcript-preview">
      <p>{text}</p>
      <div class="preview-actions">
        <button class="btn-edit" onclick={() => showTextarea = true}>
          ✏️
        </button>
        <button class="btn-primary" onclick={() => onsubmit(text.trim())}>
          {$t('barriers.continue')}
        </button>
      </div>
    </div>
  {/if}

  {#if !showTextarea && !text}
    <button class="link-btn" onclick={() => showTextarea = true}>
      {$t('barriers.orType')}
    </button>
  {/if}

  {#if showTextarea}
    <form class="text-fallback" onsubmit={handleSubmit}>
      <textarea
        bind:value={text}
        placeholder={$t('barriers.visionPlaceholder')}
        rows="4"
      ></textarea>
      <button type="submit" class="btn-primary" disabled={!text.trim()}>
        {$t('barriers.continue')}
      </button>
    </form>
  {/if}
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
    margin: 0 auto 32px;
  }
  .voice-area {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
  }
  .transcript-preview {
    background: #f0f4f8;
    border-radius: 12px;
    padding: 16px;
    margin: 0 auto 16px;
    max-width: 520px;
    text-align: left;
  }
  .transcript-preview p {
    font-size: 15px;
    line-height: 1.5;
    margin-bottom: 12px;
  }
  .preview-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .btn-edit {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    font-size: 14px;
    cursor: pointer;
  }
  .link-btn {
    background: none;
    border: none;
    color: var(--text-light);
    font-size: 14px;
    cursor: pointer;
    text-decoration: underline;
    padding: 8px;
  }
  .link-btn:hover { color: var(--text); }
  .text-fallback {
    max-width: 520px;
    margin: 16px auto 0;
  }
  textarea {
    width: 100%;
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
    margin-top: 12px;
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
