<!--
  BarrierSelect.svelte — AI analysis results + barrier selection with illustrated cards.
  Shows AI-suggested barriers as visual topic cards with Kompass illustrations.
  User selects which barriers to reflect on.

  Props:
    analyzing — true while waiting for AI response
    analysis — parsed AI response { analysis, barriers[] }
    onselect(barriers[]) — called when user confirms selection

  Used by: +page.svelte (barrier flow)
-->
<script>
  import { lang, t } from '$lib/i18n';
  import TopicCardVisual from './TopicCardVisual.svelte';

  let { analyzing, analysis, onselect } = $props();
  let selected = $state(new Set());

  function toggleBarrier(topicId) {
    const next = new Set(selected);
    if (next.has(topicId)) {
      next.delete(topicId);
    } else {
      next.add(topicId);
    }
    selected = next;
  }

  function handleContinue() {
    const barriers = analysis.barriers.filter((b) => selected.has(b.topicId));
    onselect(barriers);
  }

  // Auto-select all barriers when analysis arrives
  $effect(() => {
    if (analysis?.barriers) {
      selected = new Set(analysis.barriers.map((b) => b.topicId));
    }
  });
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
    <p class="desc">{$t('barriers.suggestedDesc')}</p>

    <div class="card-grid">
      {#each analysis.barriers as barrier}
        <TopicCardVisual
          topicId={barrier.topicId}
          reason={barrier.reason}
          level={barrier.level}
          selected={selected.has(barrier.topicId)}
          onclick={() => toggleBarrier(barrier.topicId)}
        />
      {/each}
    </div>

    <div class="actions">
      <span class="count">{selected.size} {$t('barriers.selectedCount')}</span>
      <button
        class="btn-primary"
        disabled={selected.size === 0}
        onclick={handleContinue}
      >
        {$t('barriers.reflect')}
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
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid #e8e8e8;
  }
  .count {
    font-size: 14px;
    color: var(--text-light);
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
