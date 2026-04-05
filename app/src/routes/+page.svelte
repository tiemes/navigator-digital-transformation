<!--
  +page.svelte — Compass overview (home page).
  Shows all 5 dimensions with their topics as a grid.
  Topics are clickable and link to /topic/[id].
  Matches the prototype's compass view layout.
-->
<script>
  import { lang, t } from '$lib/i18n';
  import { data, getTopicsByDimension } from '$lib/data.js';
  import TopicCard from '$lib/components/TopicCard.svelte';
</script>

<svelte:head>
  <title>{$t('app.title')}</title>
</svelte:head>

<div class="compass-intro">
  <h2>{$t('compass.title')}</h2>
  <p>{$t('compass.description')}</p>
</div>

<div class="dimensions">
  {#each data.dimensions as dim}
    {@const topics = getTopicsByDimension(dim.id)}
    <section class="dimension">
      <div class="dimension-header">
        <span class="dot" style="background: {dim.color}"></span>
        <span class="dimension-name">{dim.i18n[$lang]?.name ?? dim.id}</span>
      </div>
      <div class="topics-grid">
        {#each topics as topic (topic.id)}
          <TopicCard {topic} dimColor={dim.color} lang={$lang} />
        {/each}
      </div>
    </section>
  {/each}
</div>

<style>
  .compass-intro {
    text-align: center;
    margin-bottom: 32px;
  }
  .compass-intro h2 {
    font-size: 28px;
    margin-bottom: 8px;
  }
  .compass-intro p {
    color: var(--text-light);
    font-size: 15px;
    max-width: 600px;
    margin: 0 auto;
  }
  .dimensions {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .dimension-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    padding-left: 4px;
  }
  .dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .dimension-name {
    font-size: 15px;
    font-weight: 600;
  }
  .topics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 8px;
  }
  @media (max-width: 600px) {
    .topics-grid {
      grid-template-columns: 1fr 1fr;
    }
    .compass-intro h2 { font-size: 22px; }
  }
</style>
