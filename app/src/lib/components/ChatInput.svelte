<!--
  ChatInput.svelte — Text area + mic button + send button.
  Emits 'send' event with the message text.
  Mic button triggers voice recording (VoiceButton child).

  Props: disabled, placeholder
  Events: onsend(text)
  Used by: +page.svelte (conversation view)
-->
<script>
  import { t } from '$lib/i18n';
  import VoiceButton from './VoiceButton.svelte';

  let { disabled = false, onsend } = $props();

  let text = $state('');

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onsend?.(trimmed);
    text = '';
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTranscript(transcript) {
    text = transcript;
  }
</script>

<div class="input-row">
  <VoiceButton ontranscript={handleTranscript} {disabled} />
  <textarea
    bind:value={text}
    onkeydown={handleKeydown}
    placeholder={$t('chat.placeholder')}
    rows="2"
    {disabled}
  ></textarea>
  <button class="send-btn" onclick={handleSend} disabled={disabled || !text.trim()}>
    {$t('chat.send')}
  </button>
</div>

<style>
  .input-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    background: var(--card-bg);
    padding: 12px 16px;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
  }
  textarea {
    flex: 1;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 15px;
    font-family: inherit;
    resize: none;
    line-height: 1.4;
    min-height: 44px;
    max-height: 120px;
  }
  textarea:focus { outline: none; border-color: var(--text); }
  textarea:disabled { opacity: 0.6; }
  .send-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    background: var(--text);
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }
  .send-btn:hover:not(:disabled) { opacity: 0.9; }
  .send-btn:disabled { opacity: 0.4; cursor: default; }
</style>
