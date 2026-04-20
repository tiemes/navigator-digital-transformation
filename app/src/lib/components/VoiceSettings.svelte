<!--
  VoiceSettings.svelte — Popover for TTS voice + speed.
  Triggered by a ⚙️ button next to the 🔊 toggle. Settings persist via
  the settings store (localStorage).

  Exposed:
    trigger button: click toggles open
    radio group: 3 curated voices (shimmer / coral / sage)
    radio group: 3 speeds (0.85 / 1.0 / 1.15 — Langsam / Normal / Schnell)

  Closes on outside click or Escape.
-->
<script>
  import { t } from '$lib/i18n';
  import {
    ttsVoice, ttsSpeed, VOICE_OPTIONS, SPEED_OPTIONS,
  } from '$lib/stores/settings.js';

  let open = $state(false);
  let popoverEl = $state(null);
  let triggerEl = $state(null);

  const speedLabels = {
    0.85: () => $t('chat.speedSlow'),
    1.0: () => $t('chat.speedNormal'),
    1.15: () => $t('chat.speedFast'),
  };

  function toggle() { open = !open; }

  // Outside-click + Escape. Attach on next tick so the opening click
  // doesn't immediately close the popover (Svelte 5 event delegation
  // means the trigger click would bubble to document before the handler
  // could be added synchronously).
  $effect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (popoverEl?.contains(e.target) || triggerEl?.contains(e.target)) return;
      open = false;
    };
    const onKey = (e) => { if (e.key === 'Escape') open = false; };
    const tid = setTimeout(() => {
      document.addEventListener('click', onClick);
      document.addEventListener('keydown', onKey);
    }, 0);
    return () => {
      clearTimeout(tid);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  });
</script>

<div class="voice-settings-root">
  <button
    bind:this={triggerEl}
    class="trigger"
    onclick={toggle}
    title={$t('chat.voiceSettingsHint')}
    aria-label={$t('chat.voiceSettingsTitle')}
    aria-expanded={open}
  >⚙️</button>

  {#if open}
    <div bind:this={popoverEl} class="popover" role="dialog" aria-label={$t('chat.voiceSettingsTitle')}>
      <h3>{$t('chat.voiceSettingsTitle')}</h3>

      <fieldset>
        <legend>{$t('chat.voiceLabel')}</legend>
        {#each VOICE_OPTIONS as v}
          <label class="radio">
            <input type="radio" name="voice" value={v} bind:group={$ttsVoice} />
            <span>{v[0].toUpperCase() + v.slice(1)}</span>
          </label>
        {/each}
      </fieldset>

      <fieldset>
        <legend>{$t('chat.speedLabel')}</legend>
        {#each SPEED_OPTIONS as s}
          <label class="radio">
            <input type="radio" name="speed" value={s} bind:group={$ttsSpeed} />
            <span>{speedLabels[s]()} ({s}×)</span>
          </label>
        {/each}
      </fieldset>

      <button class="close-btn" onclick={() => open = false}>
        {$t('chat.close')}
      </button>
    </div>
  {/if}
</div>

<style>
  .voice-settings-root { position: relative; display: inline-block; }
  .trigger {
    border: none;
    background: none;
    font-size: 18px;
    padding: 4px 8px;
    opacity: 0.6;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .trigger:hover { opacity: 1; }
  .popover {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 6px;
    min-width: 240px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 14px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
    z-index: 20;
    text-align: left;
  }
  .popover h3 {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-light);
    margin: 0 0 10px;
  }
  fieldset {
    border: none;
    padding: 0;
    margin: 0 0 12px;
  }
  legend {
    font-size: 12px;
    color: var(--text-light);
    margin-bottom: 6px;
  }
  .radio {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    padding: 4px 0;
    cursor: pointer;
  }
  .radio input { margin: 0; }
  .close-btn {
    width: 100%;
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    font-size: 13px;
    color: var(--text);
    cursor: pointer;
    margin-top: 4px;
  }
  .close-btn:hover { border-color: var(--text); }
</style>
