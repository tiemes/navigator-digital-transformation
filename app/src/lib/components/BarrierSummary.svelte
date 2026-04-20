<!--
  BarrierSummary.svelte — Closing page after the barrier reflection.
  Generates "themes heard" + "ideas to sit with" via the LLM — NOT an assessment.
  Always offers JSON/CSV export and start-over/back-to-home.

  Props:
    vision — the user's vision statement
    reflections — array of barrier reflections with responses
    onrestart() — called when user wants to start over

  Used by: +page.svelte (barrier flow)
-->
<script>
  import { lang, t } from '$lib/i18n';
  import { topicName, getTopic } from '$lib/data.js';
  import { chat } from '$lib/api.js';
  import { getSessionSnapshot, addAiInteraction } from '$lib/stores/session.js';
  import { browser } from '$app/environment';

  let { vision, reflections, onrestart } = $props();

  let loading = $state(true);
  let errorText = $state('');
  let themes = $state([]);
  let ideas = $state([]);

  const hasAnyResponse = $derived(
    reflections.some((r) => (r.responses || []).some((x) => x.response && !x.skipped))
  );

  $effect(() => {
    if (browser) generateSummary();
  });

  async function generateSummary() {
    loading = true;
    errorText = '';

    if (!hasAnyResponse) {
      loading = false;
      return;
    }

    const reflectionLog = reflections
      .map((ref) => {
        const lines = (ref.responses || [])
          .filter((r) => r.response || r.questionText)
          .map((r) => `F: ${r.questionText || r.questionId}\nA: ${r.response || '(übersprungen)'}`)
          .join('\n');
        return `## Thema: ${topicName(ref.topicId, $lang)}\n${lines}`;
      })
      .join('\n\n');

    const system = `Du bist ein wertschätzender Reflexionspartner. Eine Lehrperson oder Schulleitung hat am Navigator reflektiert. Formuliere eine wohlwollende Abschlussseite.

Vision: "${vision}"

Reflektierte Themen und Antworten:
${reflectionLog}

SEHR WICHTIG:
- KEINE Bewertung, KEIN Assessment, KEINE Einschätzung.
- Spiegel zurück, was mitschwingt — ohne zu werten.
- Du-Form, in der Sprache der Vision.
- "themes": 2-3 wiederkehrende Motive / Spannungen / Anliegen. Jedes: kurzer Titel + 1-2 Sätze, die die Person spiegeln.
- "ideas": 3-5 Gedankenanstösse. Jede Idee ist an ein Kompass-Thema (topicId) geknüpft und gibt einen offenen Impuls (eine Frage), KEINE Handlungsanweisung.

Verfügbare Topic-IDs:
personal-social-skills, professional-skills-media-cs, specialised-didactics-media-cs, media-didactics, application-skills-teachers, mindsets, parent-participation, learning-culture, interdisciplinary-skills, assessment, teaching-learning-units, learning-platforms-tools, media-cs-curriculum, media-education-rules, class-administration, vision, structures-processes, concept, support, leadership, learning-spaces, innovation, public-relations, cooperation, knowledge-management, communication, team-culture, dynamics-emotions, working-devices, basic-infrastructure, software-services, security, services, legal-aspects, funding, artificial-intelligence

Antworte als reines JSON:
{
  "themes": [{"title": "...", "summary": "..."}],
  "ideas": [{"topicId": "...", "thoughtStarter": "..."}]
}`;

    try {
      const startTime = Date.now();
      const res = await chat(
        [{ role: 'system', content: system }],
        { temperature: 0.5, max_tokens: 800 }
      );
      addAiInteraction({
        promptTemplate: 'ideas-summary-v1',
        model: res.model || 'unknown',
        inputTokens: res.usage?.prompt_tokens,
        outputTokens: res.usage?.completion_tokens,
        latencyMs: Date.now() - startTime,
      });
      const raw = res.choices?.[0]?.message?.content ?? '';
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : {};
      }
      themes = Array.isArray(parsed.themes) ? parsed.themes : [];
      ideas = Array.isArray(parsed.ideas) ? parsed.ideas : [];
    } catch (err) {
      console.error('Summary error:', err);
      errorText = $t('barriers.summaryError');
    } finally {
      loading = false;
    }
  }

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
      ['barrierLevel', 'topicId', 'topicVersion', 'questionId', 'questionVersion',
       'questionSource', 'questionText', 'response', 'skipped', 'timestamp'].join(','),
    ];
    for (const barrier of snapshot.barriers) {
      for (const r of barrier.reflections || []) {
        rows.push([
          barrier.level,
          barrier.topicId,
          barrier.topicVersion ?? '',
          r.questionId,
          r.questionVersion ?? '',
          r.questionSource ?? '',
          `"${(r.questionText || '').replace(/"/g, '""')}"`,
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

  {#if vision}
    <div class="section vision">
      <h3>{$t('barriers.summaryVision')}</h3>
      <p class="vision-text">{vision}</p>
    </div>
  {/if}

  {#if loading}
    <div class="loading">
      <div class="pulse-ring"></div>
      <p>{$t('barriers.thinkingIdeas')}</p>
    </div>
  {:else if !hasAnyResponse}
    <p class="empty">{$t('barriers.summaryNoData')}</p>
  {:else}
    {#if themes.length > 0}
      <div class="section">
        <h3>{$t('barriers.summaryThemes')}</h3>
        {#each themes as theme}
          <div class="theme-card">
            <h4>{theme.title}</h4>
            <p>{theme.summary}</p>
          </div>
        {/each}
      </div>
    {/if}

    {#if ideas.length > 0}
      <div class="section">
        <h3>{$t('barriers.summaryIdeas')}</h3>
        {#each ideas as idea}
          <div class="idea-card">
            {#if idea.topicId}
              <a class="idea-topic" href="/topic/{idea.topicId}">
                {topicName(idea.topicId, $lang)} →
              </a>
            {/if}
            <p class="thought-starter">{idea.thoughtStarter}</p>
          </div>
        {/each}
      </div>
    {/if}

    {#if errorText}
      <p class="error">{errorText}</p>
    {/if}
  {/if}

  <div class="export-actions">
    <button class="btn-export" onclick={exportJSON}>{$t('barriers.exportJSON')}</button>
    <button class="btn-export" onclick={exportCSV}>{$t('barriers.exportCSV')}</button>
  </div>

  <div class="nav-actions">
    <button class="btn-secondary" onclick={onrestart}>{$t('barriers.startOver')}</button>
    <a href="/" class="btn-secondary">{$t('barriers.backToHome')}</a>
  </div>
</div>

<style>
  .summary-step { text-align: left; }
  h2 {
    font-size: 24px; font-weight: 600; margin-bottom: 24px; text-align: center;
  }
  .section { margin-bottom: 24px; }
  h3 {
    font-size: 13px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.5px; color: var(--text-light); margin-bottom: 10px;
  }
  h4 { font-size: 16px; font-weight: 600; margin: 0 0 6px; }
  .vision-text {
    font-size: 15px; line-height: 1.6;
    background: #f0f4f8; padding: 14px; border-radius: 10px;
  }
  .loading { text-align: center; padding: 32px 0; color: var(--text-light); }
  .pulse-ring {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid var(--text-light); margin: 0 auto 14px;
    animation: pulse-ring 1.5s ease-out infinite;
  }
  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(1.4); opacity: 0; }
  }
  .theme-card {
    margin-bottom: 12px; padding: 14px;
    border: 1px solid #e8e8e8; border-radius: 10px;
  }
  .theme-card p { font-size: 14px; line-height: 1.5; color: var(--text); margin: 0; }
  .idea-card {
    margin-bottom: 12px; padding: 14px;
    border-left: 3px solid var(--text-light); background: #fafafa;
    border-radius: 0 10px 10px 0;
  }
  .idea-topic {
    display: inline-block; margin-bottom: 6px;
    font-size: 12px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.5px; color: var(--text);
    text-decoration: none;
  }
  .idea-topic:hover { text-decoration: underline; }
  .thought-starter { font-size: 15px; line-height: 1.6; margin: 0; }
  .empty {
    text-align: center; padding: 24px; color: var(--text-light);
    font-style: italic;
  }
  .error { font-size: 13px; color: #c0392b; margin-bottom: 12px; }
  .export-actions { display: flex; gap: 12px; margin: 24px 0; }
  .btn-export {
    flex: 1; padding: 10px 16px; border: 1px solid #ddd; border-radius: 8px;
    background: #fff; font-size: 14px; cursor: pointer;
  }
  .btn-export:hover { border-color: var(--text); }
  .nav-actions {
    display: flex; gap: 12px; justify-content: center;
    padding-top: 16px; border-top: 1px solid #e8e8e8;
  }
  .btn-secondary {
    padding: 8px 20px; border: 1px solid #ddd; border-radius: 8px;
    background: #fff; font-size: 14px; color: var(--text);
    text-decoration: none; cursor: pointer;
  }
  .btn-secondary:hover { border-color: var(--text); }
</style>
