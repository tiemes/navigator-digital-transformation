<!--
  topic/[id]/+page.svelte — Topic detail view.
  Shows all reflection questions for a topic and connected topic chips.
  Matches the prototype's topic detail layout.
-->
<script>
  import { lang, t } from '$lib/i18n';
  import { getTopic, getDimension, topicName } from '$lib/data.js';

  let { data: pageData } = $props();
  let topic = $derived(getTopic(pageData.topicId));
  let dim = $derived(topic ? getDimension(topic.dimension) : null);
</script>

<svelte:head>
  <title>{topic?.i18n[$lang]?.name ?? ''} — {$t('app.title')}</title>
</svelte:head>

{#if topic && dim}
  <div class="topic-detail">
    <a href="/" class="back">&larr; {$t('nav.back')}</a>

    <div class="header">
      <span class="dim-label" style="color: {dim.color}">
        {dim.i18n[$lang]?.name}
      </span>
    </div>
    <h1 class="title">{topic.i18n[$lang]?.name}</h1>

    <h2 class="section-title">{$t('topic.questions')}</h2>
    <div class="questions">
      {#each topic.questions as q (q.id)}
        <div class="question">
          <p class="question-text">{q.i18n[$lang] || q.i18n.de}</p>
          <div class="tags">
            {#each q.tags as tag}
              <span class="tag">{tag}</span>
            {/each}
            {#if q.source === 'research-addition'}
              <span class="tag new">{$t('compass.newQuestions')}</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    {#if topic.links.length > 0}
      <h3 class="connections-title">{$t('topic.connected')}</h3>
      <div class="connections">
        {#each topic.links as linkId}
          <a
            class="chip"
            href="/topic/{linkId}"
            style="background: {getDimension(getTopic(linkId)?.dimension)?.color ?? '#888'}"
          >
            {topicName(linkId, $lang)}
          </a>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <p>{$t('common.error')}</p>
{/if}

<style>
  .topic-detail { max-width: 720px; margin: 0 auto; }
  .back {
    display: inline-block;
    margin-bottom: 16px;
    font-size: 14px;
    color: var(--text-light);
  }
  .header { margin-bottom: 4px; }
  .dim-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .title { font-size: 28px; font-weight: 600; margin-bottom: 24px; }
  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-light);
  }
  .questions { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
  .question {
    background: var(--card-bg);
    border-radius: var(--radius);
    padding: 20px;
    box-shadow: var(--shadow);
  }
  .question-text { font-size: 16px; line-height: 1.5; margin-bottom: 10px; }
  .tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .tag {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 4px;
    background: #f0f0f0;
    color: var(--text-light);
  }
  .tag.new { background: #fef9e7; color: #f39c12; }
  .connections-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--text-light);
  }
  .connections { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    color: #fff;
    font-weight: 500;
    transition: all 0.15s;
    text-decoration: none;
  }
  .chip:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    text-decoration: none;
  }
  @media (max-width: 600px) {
    .title { font-size: 22px; }
  }
</style>
