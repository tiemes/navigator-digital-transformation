<!--
  BarrierSummary.svelte — End-of-session summary with export options.
  Shows vision, barriers explored, and reflections.
  Allows exporting session data as JSON or CSV.

  Props:
    vision — the user's vision statement
    reflections — array of barrier reflections with responses
    onrestart() — called when user wants to start over

  Used by: barriers/+page.svelte
-->
<script>
  import { lang, t } from '$lib/i18n';
  import { topicName } from '$lib/data.js';
  import { getSessionSnapshot } from '$lib/stores/session.js';
  import { browser } from '$app/environment';

  let { vision, reflections, onrestart } = $props();

  const levelColors = {
    'teacher-level': 'var(--people)',
    'school-level': 'var(--organisation)',
    'system-level': 'var(--infrastructure)',
  };

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    const snapshot = getSessionSnapshot();
    const filename = `navigator-session-${snapshot.sessionId.slice(0, 8)}.json`;
    downloadFile(JSON.stringify(snapshot, null, 2), filename, 'application/json');
  }

  function exportCSV() {
    const snapshot = getSessionSnapshot();
    const rows = [
      ['barrierLevel', 'topicId', 'questionId', 'questionVersion', 'response', 'skipped', 'timestamp'].join(','),
    ];
    for (const barrier of snapshot.barriers) {
      for (const r of barrier.reflections || []) {
        rows.push([
          barrier.level,
          barrier.topicId,
          r.questionId,
          r.questionVersion,
          `"${(r.response || '').replace(/"/g, '""')}"`,
          r.skipped,
          r.timestamp,
        ].join(','));
      }
    }
    const filename = `navigator-session-${snapshot.sessionId.slice(0, 8)}.csv`;
    downloadFile(rows.join('\n'), filename, 'text/csv');
  }
</script>

<div class="summary-step">
  <h2>{$t('barriers.summaryTitle')}</h2>

  <div class="section">
    <h3>{$t('barriers.summaryVision')}</h3>
    <p class="vision-text">{vision}</p>
  </div>

  <div class="section">
    <h3>{$t('barriers.summaryBarriers')}</h3>
    {#each reflections as ref}
      <div class="barrier-summary">
        <span class="badge" style="background: {levelColors[ref.level]}">
          {topicName(ref.topicId, $lang)}
        </span>
        {#each ref.responses as r}
          {#if r.response}
            <p class="reflection-text">{r.response}</p>
          {/if}
        {/each}
      </div>
    {/each}
  </div>

  <div class="export-actions">
    <button class="btn-export" onclick={exportJSON}>
      {$t('barriers.exportJSON')}
    </button>
    <button class="btn-export" onclick={exportCSV}>
      {$t('barriers.exportCSV')}
    </button>
  </div>

  <div class="nav-actions">
    <button class="btn-secondary" onclick={onrestart}>
      {$t('barriers.startOver')}
    </button>
    <a href="/" class="btn-secondary">
      {$t('barriers.backToHome')}
    </a>
  </div>
</div>

<style>
  .summary-step { text-align: left; }
  h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 24px;
    text-align: center;
  }
  .section {
    margin-bottom: 24px;
  }
  h3 {
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-light);
    margin-bottom: 10px;
  }
  .vision-text {
    font-size: 15px;
    line-height: 1.6;
    background: #f0f4f8;
    padding: 14px;
    border-radius: 10px;
  }
  .barrier-summary {
    margin-bottom: 16px;
    padding: 14px;
    border: 1px solid #e8e8e8;
    border-radius: 10px;
  }
  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .reflection-text {
    font-size: 14px;
    line-height: 1.5;
    color: var(--text);
    margin-top: 8px;
    padding-left: 10px;
    border-left: 2px solid #e8e8e8;
  }
  .export-actions {
    display: flex;
    gap: 12px;
    margin: 24px 0;
  }
  .btn-export {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    font-size: 14px;
    cursor: pointer;
  }
  .btn-export:hover { border-color: var(--text); }
  .nav-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding-top: 16px;
    border-top: 1px solid #e8e8e8;
  }
  .btn-secondary {
    padding: 8px 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    font-size: 14px;
    color: var(--text);
    text-decoration: none;
    cursor: pointer;
  }
  .btn-secondary:hover { border-color: var(--text); }
</style>
