<!--
  TopicCardVisual.svelte — Illustrated topic card with Kompass artwork.
  Shows topic illustration, name, and optional reason/badge.
  Toggleable selected state with dimension color accent.

  Props:
    topicId — topic ID from navigator.json
    reason — optional short text (e.g. AI barrier reason)
    level — optional barrier level for badge (teacher/school/system)
    selected — whether card is selected
    onclick — click handler

  Used by: BarrierSelect.svelte
-->
<script>
  import { lang } from '$lib/i18n';
  import { getTopic, topicName } from '$lib/data.js';

  let { topicId, reason = '', level = '', selected = false, onclick } = $props();

  const topic = $derived(getTopic(topicId));
  const name = $derived(topicName(topicId, $lang));
  const illustration = $derived(topic?.illustration ? `/illustrations/${topic.illustration}` : null);

  const dimensionColors = {
    'people-skills': 'var(--people)',
    'teaching-learning': 'var(--teaching)',
    'organisation-structures': 'var(--organisation)',
    'cooperation-team': 'var(--cooperation)',
    'infrastructure': 'var(--infrastructure)',
  };

  const levelLabels = {
    'teacher-level': { de: 'Lehrperson', en: 'Teacher' },
    'school-level': { de: 'Schule', en: 'School' },
    'system-level': { de: 'System', en: 'System' },
  };

  const color = $derived(dimensionColors[topic?.dimension] || '#888');
  const levelLabel = $derived(levelLabels[level]?.[$lang] || '');
</script>

<button
  class="topic-card-visual"
  class:selected
  style="--accent: {color}"
  {onclick}
>
  {#if selected}
    <span class="check">✓</span>
  {/if}

  {#if illustration}
    <img src={illustration} alt={name} class="illustration" />
  {/if}

  <div class="info">
    <span class="name">{name}</span>
    {#if levelLabel}
      <span class="level-badge">{levelLabel}</span>
    {/if}
    {#if reason}
      <span class="reason">{reason}</span>
    {/if}
  </div>
</button>

<style>
  .topic-card-visual {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 12px 14px;
    border: 2px solid #e0e0e0;
    border-radius: 14px;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
    text-align: center;
    min-height: 160px;
  }
  .topic-card-visual:hover {
    border-color: var(--accent);
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    transform: translateY(-2px);
  }
  .topic-card-visual.selected {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 6%, white);
    box-shadow: 0 2px 12px color-mix(in srgb, var(--accent) 20%, transparent);
  }
  .check {
    position: absolute;
    top: 8px;
    right: 10px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--accent);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .illustration {
    width: 80px;
    height: 80px;
    object-fit: contain;
    margin-bottom: 10px;
    opacity: 0.9;
  }
  .info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }
  .name {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--text);
  }
  .level-badge {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--accent);
    opacity: 0.8;
  }
  .reason {
    font-size: 12px;
    color: var(--text-light);
    line-height: 1.3;
    margin-top: 2px;
  }
</style>
