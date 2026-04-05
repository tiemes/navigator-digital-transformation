<!--
  TopicCard.svelte — Single topic card in the compass grid.
  Shows topic number, name, question count, and "new" badge.
  Left border coloured by dimension.

  Props: topic, dimColor, lang
  Used by: +page.svelte (compass overview)
-->
<script>
  let { topic, dimColor, lang } = $props();

  import { t } from '$lib/i18n';

  let newCount = $derived(
    topic.questions.filter((q) => q.source === 'research-addition').length
  );
</script>

<a class="card" style="border-left: 3px solid {dimColor}" href="/topic/{topic.id}">
  <div class="number">
    {topic.number} &middot; {topic.questions.length} {$t('compass.questionCount')}
  </div>
  <div class="name">{topic.i18n[lang]?.name ?? topic.id}</div>
  {#if newCount > 0}
    <span class="badge">+{newCount} {$t('compass.newQuestions')}</span>
  {/if}
</a>

<style>
  .card {
    display: block;
    background: var(--card-bg);
    border-radius: var(--radius);
    padding: 14px 16px;
    border: 2px solid transparent;
    transition: all 0.15s;
    box-shadow: var(--shadow);
    text-decoration: none;
    color: inherit;
  }
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    text-decoration: none;
  }
  .number {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-light);
    margin-bottom: 2px;
  }
  .name { font-size: 13px; font-weight: 500; }
  .badge {
    display: inline-block;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 4px;
    background: #e8f8f5;
    color: #1abc9c;
    margin-top: 4px;
    font-weight: 600;
  }
</style>
