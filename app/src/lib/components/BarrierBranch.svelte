<!--
  BarrierBranch.svelte — After reflecting on one barrier, offer 3 AI-suggested
  threads + a "wrap up with ideas" button.

  The AI picks options based on the conversation so far, the topic's links,
  and the remaining unexplored initial barriers.

  Props:
    vision — the user's vision statement
    lastBarrier — the barrier just finished
    exploredTopicIds — string[] — topic IDs already reflected on
    remainingBarriers — object[] — initial AI-suggested barriers not yet explored
    onpick(choice) — choice = { type, topicId, label, why } | { type: 'wrap' }
    onendnow() — user clicks "Genug für heute"

  Used by: +page.svelte (barrier flow)
-->
<script>
  import { lang, t } from '$lib/i18n';
  import { getTopic, topicName } from '$lib/data.js';
  import { chat } from '$lib/api.js';
  import { addAiInteraction } from '$lib/stores/session.js';

  let {
    vision = '',
    lastBarrier,
    exploredTopicIds = [],
    remainingBarriers = [],
    onpick,
    onendnow,
  } = $props();

  let options = $state([]);
  let loading = $state(true);
  let errorText = $state('');

  $effect(() => {
    if (lastBarrier) {
      loadOptions();
    }
  });

  async function loadOptions() {
    loading = true;
    errorText = '';
    options = [];

    const lastTopic = getTopic(lastBarrier.topicId);
    const linkedTopics = lastTopic?.links || [];
    const remainingTopicIds = remainingBarriers.map((b) => b.topicId);

    const system = `Du bist ein Reflexionsbegleiter. Du hast gerade mit jemandem über "${topicName(lastBarrier.topicId, $lang)}" gesprochen. Jetzt schlägst du DREI mögliche nächste Richtungen vor — in DU-Form, als würdest du direkt mit dieser Person reden.

Vision der Person: "${vision}"

Bereits reflektierte Themen: ${exploredTopicIds.join(', ') || '(keine)'}
Ursprünglich als Hindernis vorgeschlagen, noch nicht bearbeitet: ${remainingTopicIds.join(', ') || '(keine)'}
Mit dem letzten Thema verwandte Topics: ${linkedTopics.join(', ') || '(keine)'}

Verfügbare Topic-IDs:
personal-social-skills, professional-skills-media-cs, specialised-didactics-media-cs, media-didactics, application-skills-teachers, mindsets, parent-participation, learning-culture, interdisciplinary-skills, assessment, teaching-learning-units, learning-platforms-tools, media-cs-curriculum, media-education-rules, class-administration, vision, structures-processes, concept, support, leadership, learning-spaces, innovation, public-relations, cooperation, knowledge-management, communication, team-culture, dynamics-emotions, working-devices, basic-infrastructure, software-services, security, services, legal-aspects, funding, artificial-intelligence

Regeln:
- Genau DREI Optionen.
- Eine "deeper" (vertieft, was gerade angerissen wurde — idealerweise aus den verwandten Topics).
- Eine "another" (anderer Blickwinkel, andere Ebene — Lehrperson / Schule / System).
- Die dritte wählst du frei.
- NUTZE KEINE topicId aus "bereits reflektierte Themen".
- Jedes "why" ist EIN Satz in DU-Form, der sich auf etwas bezieht, das du eben gehört hast. Z.B. "Du hast erwähnt, dass..." oder "Ich höre bei dir...". Keine abstrakten Begründungen, kein "die Lehrperson", kein "die Schule".
- "label" ist ein kurzer, konkreter Titel (3-5 Wörter) — keine Frage.
- Antworte in der Sprache der Vision.

Antworte als reines JSON:
{"options": [
  {"type": "deeper", "topicId": "...", "label": "Kurzer Titel", "why": "..."},
  {"type": "another", "topicId": "...", "label": "...", "why": "..."},
  {"type": "deeper", "topicId": "...", "label": "...", "why": "..."}
]}`;

    try {
      const startTime = Date.now();
      const res = await chat(
        [{ role: 'system', content: system }],
        { temperature: 0.6, max_tokens: 400 }
      );
      addAiInteraction({
        promptTemplate: 'branch-options-v1',
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
        parsed = match ? JSON.parse(match[0]) : { options: [] };
      }
      options = Array.isArray(parsed.options) ? parsed.options.slice(0, 3) : [];
      if (options.length === 0) errorText = $t('common.error');
    } catch (err) {
      console.error('Branch options error:', err);
      errorText = err.message || $t('common.error');
    } finally {
      loading = false;
    }
  }

  const offeredTopicIds = $derived(options.map((o) => o.topicId));

  function pick(option) {
    onpick({
      type: option.type,
      topicId: option.topicId,
      label: option.label,
      why: option.why,
      offeredTopicIds,
    });
  }

  function wrap() {
    onpick({ type: 'wrap', offeredTopicIds });
  }
</script>

<div class="branch-step">
  <div class="progress">
    <h2>{$t('barriers.branchTitle')}</h2>
    <button class="end-now" onclick={onendnow} title={$t('barriers.endNowHint')}>
      {$t('barriers.endNow')}
    </button>
  </div>
  <p class="desc">{$t('barriers.branchDesc')}</p>

  {#if loading}
    <div class="loading">
      <div class="pulse-ring"></div>
      <p>{$t('barriers.thinkingBranch')}</p>
    </div>
  {:else}
    <div class="option-list">
      {#each options as opt}
        <button class="option-card" onclick={() => pick(opt)}>
          <span class="option-type">
            {opt.type === 'deeper' ? $t('barriers.branchDeeper') : $t('barriers.branchAnother')}
          </span>
          <span class="option-label">{opt.label}</span>
          {#if opt.why}
            <span class="option-why">{opt.why}</span>
          {/if}
        </button>
      {/each}
    </div>

    {#if errorText && options.length === 0}
      <p class="error">{errorText}</p>
    {/if}

    <button class="btn-wrap" onclick={wrap}>
      ✨ {$t('barriers.branchWrap')}
    </button>
  {/if}
</div>

<style>
  .branch-step { text-align: left; }
  .progress {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 6px;
  }
  h2 { font-size: 22px; font-weight: 600; margin: 0; }
  .end-now {
    background: none; border: none; color: var(--text-light);
    font-size: 13px; cursor: pointer; padding: 4px 8px;
    text-decoration: underline;
  }
  .end-now:hover { color: var(--text); }
  .desc { font-size: 14px; color: var(--text-light); margin-bottom: 20px; }
  .loading { text-align: center; padding: 48px 0; color: var(--text-light); }
  .pulse-ring {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid var(--text-light); margin: 0 auto 14px;
    animation: pulse-ring 1.5s ease-out infinite;
  }
  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(1.4); opacity: 0; }
  }
  .option-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
  .option-card {
    display: flex; flex-direction: column; gap: 4px;
    padding: 16px; border: 1px solid #e8e8e8; border-radius: 12px;
    background: #fff; cursor: pointer; text-align: left;
    transition: border-color 0.15s, transform 0.15s;
  }
  .option-card:hover { border-color: var(--text); transform: translateY(-1px); }
  .option-type {
    font-size: 11px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.5px; color: var(--text-light);
  }
  .option-label { font-size: 16px; font-weight: 500; color: var(--text); }
  .option-why { font-size: 14px; color: var(--text-light); line-height: 1.5; }
  .btn-wrap {
    display: block; width: 100%; padding: 14px;
    border: 1px dashed #bbb; border-radius: 12px;
    background: #fafafa; font-size: 15px; font-weight: 500;
    color: var(--text); cursor: pointer;
  }
  .btn-wrap:hover { background: #f0f0f0; border-style: solid; }
  .error { font-size: 13px; color: #c0392b; margin-bottom: 12px; }
</style>
