<!--
  BarrierSelect.svelte — AI analysis results. User picks ONE barrier to start.
  After that barrier is reflected on, the branch screen offers next directions.

  Props:
    analyzing — true while waiting for AI response
    analysis — parsed AI response { analysis, barriers[] }
    onselect(barrier) — called when user picks one barrier

  Used by: +page.svelte (barrier flow)
-->
<script>
  import { lang, t } from '$lib/i18n';
  import TopicCardVisual from './TopicCardVisual.svelte';

  let { analyzing, analysis, onselect } = $props();
  let picked = $state(null);

  function pickBarrier(topicId) {
    picked = picked === topicId ? null : topicId;
  }

  function handleContinue() {
    const barrier = analysis.barriers.find((b) => b.topicId === picked);
    if (barrier) onselect(barrier);
  }
</script>

<div class="select-step">
  {#if analyzing}
    <div class="loading">
      <div class="pulse-ring"></div>
      <p>{$t('barriers.analyzing')}</p>
    </div>
  {:else if analysis}
    {#if analysis.analysis}
      <p class="ai-summary">{analysis.analysis}</p>
    {/if}

    <h2>{$t('barriers.suggestedBarriers')}</h2>
    <p class="desc">{$t('barriers.pickOne')}</p>

    <div class="card-grid">
      {#each analysis.barriers as barrier}
        <TopicCardVisual
          topicId={barrier.topicId}
          reason={barrier.reason}
          level={barrier.level}
          selected={picked === barrier.topicId}
          onclick={() => pickBarrier(barrier.topicId)}
        />
      {/each}
    </div>

    <div class="actions">
      <button
        class="btn-primary"
        disabled={!picked}
        onclick={handleContinue}
      >
        {$t('barriers.startWithThis')}
      </button>
    </div>
  {/if}
</div>

<style>
  .select-step { text-align: left; }
  .loading {
    text-align: center;
    padding: 64px 0;
    color: var(--text-light);
  }
  .pulse-ring {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 3px solid var(--text-light);
    margin: 0 auto 16px;
    animation: pulse-ring 1.5s ease-out infinite;
  }
  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(1.4); opacity: 0; }
  }
  .ai-summary {
    font-size: 15px;
    line-height: 1.6;
    color: var(--text);
    background: #f0f4f8;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 28px;
  }
  h2 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 6px;
  }
  .desc {
    font-size: 14px;
    color: var(--text-light);
    margin-bottom: 20px;
  }
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 14px;
    margin-bottom: 24px;
  }
  .actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid #e8e8e8;
  }
  .btn-primary {
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
