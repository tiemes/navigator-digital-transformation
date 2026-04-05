<!--
  BarrierSelect.svelte — AI analysis results + barrier selection step.
  Shows AI-suggested barriers grouped by level (teacher/school/system).
  User selects which barriers to reflect on.

  Props:
    analyzing — true while waiting for AI response
    analysis — parsed AI response { analysis, barriers[] }
    onselect(barriers[]) — called when user confirms selection

  Used by: barriers/+page.svelte
-->
<script>
  import { lang, t } from '$lib/i18n';
  import { topicName } from '$lib/data.js';

  let { analyzing, analysis, onselect } = $props();
  let selected = $state(new Set());

  const levelLabels = {
    'teacher-level': 'barriers.levelTeacher',
    'school-level': 'barriers.levelSchool',
    'system-level': 'barriers.levelSystem',
  };

  const levelColors = {
    'teacher-level': 'var(--people)',
    'school-level': 'var(--organisation)',
    'system-level': 'var(--infrastructure)',
  };

  const levelOrder = ['teacher-level', 'school-level', 'system-level'];

  let groupedBarriers = $derived(() => {
    if (!analysis?.barriers) return {};
    const groups = {};
    for (const b of analysis.barriers) {
      if (!groups[b.level]) groups[b.level] = [];
      groups[b.level].push(b);
    }
    return groups;
  });

  function toggleBarrier(barrier) {
    const key = barrier.topicId;
    const next = new Set(selected);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
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
      <span class="dot-pulse"></span>
      <p>{$t('barriers.analyzing')}</p>
    </div>
  {:else if analysis}
    {#if analysis.analysis}
      <p class="ai-summary">{analysis.analysis}</p>
    {/if}

    <h2>{$t('barriers.suggestedBarriers')}</h2>
    <p class="desc">{$t('barriers.suggestedDesc')}</p>

    {#each levelOrder as level}
      {#if groupedBarriers()[level]}
        <div class="level-group">
          <h3 style="border-color: {levelColors[level]}">
            {$t(levelLabels[level])}
          </h3>
          {#each groupedBarriers()[level] as barrier}
            <button
              class="barrier-card"
              class:selected={selected.has(barrier.topicId)}
              style="--accent: {levelColors[barrier.level]}"
              onclick={() => toggleBarrier(barrier)}
            >
              <span class="topic-name">{topicName(barrier.topicId, $lang)}</span>
              <span class="reason">{barrier.reason}</span>
            </button>
          {/each}
        </div>
      {/if}
    {/each}

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
    padding: 48px 0;
    color: var(--text-light);
  }
  .dot-pulse {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--text-light);
    animation: pulse-dot 1.2s infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
  .ai-summary {
    font-size: 15px;
    line-height: 1.6;
    color: var(--text);
    background: #f0f4f8;
    padding: 16px;
    border-radius: 10px;
    margin-bottom: 24px;
  }
  h2 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .desc {
    font-size: 14px;
    color: var(--text-light);
    margin-bottom: 20px;
  }
  .level-group { margin-bottom: 20px; }
  h3 {
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding-bottom: 6px;
    border-bottom: 3px solid;
    margin-bottom: 10px;
  }
  .barrier-card {
    display: block;
    width: 100%;
    text-align: left;
    padding: 12px 14px;
    margin-bottom: 8px;
    border: 2px solid #e8e8e8;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .barrier-card.selected {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 5%, white);
  }
  .topic-name {
    display: block;
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 4px;
  }
  .reason {
    display: block;
    font-size: 13px;
    color: var(--text-light);
    line-height: 1.4;
  }
  .actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 24px;
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
