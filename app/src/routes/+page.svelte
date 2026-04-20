<!--
  +page.svelte — Primary landing page.
  Flow: vision → AI barrier analysis → pick 1 barrier → reflect
        → branch screen (3 AI threads + wrap) → loop OR summary.
  "End now" is available from every barrier/branch screen.
-->
<script>
  import { t } from '$lib/i18n';
  import { chat, speak } from '$lib/api.js';
  import { getTopic } from '$lib/data.js';
  import {
    startSession, setVision, addBarrier, addBranchChoice,
    addAiInteraction, markEndedEarly, finalizeSession, getSessionSnapshot,
  } from '$lib/stores/session.js';
  import { autoSend, ttsVoice, ttsSpeed } from '$lib/stores/settings.js';
  import { saveSession } from '$lib/stores/db.js';
  import { browser } from '$app/environment';
  import BarrierVision from '$lib/components/BarrierVision.svelte';
  import BarrierSelect from '$lib/components/BarrierSelect.svelte';
  import BarrierReflect from '$lib/components/BarrierReflect.svelte';
  import BarrierBranch from '$lib/components/BarrierBranch.svelte';
  import BarrierSummary from '$lib/components/BarrierSummary.svelte';
  import VoiceSettings from '$lib/components/VoiceSettings.svelte';

  /** @type {'vision' | 'analysis' | 'reflection' | 'branch' | 'summary'} */
  let step = $state('vision');
  let visionText = $state('');
  let analyzing = $state(false);
  let ttsEnabled = $state(true);
  let aiAnalysis = $state(null);

  /** The barrier currently being reflected on. */
  let currentBarrier = $state(null);
  /** Array of finalised barrier reflections (what the summary reads). */
  let reflections = $state([]);
  /** Topic IDs that have been explored so far. */
  let exploredTopicIds = $state([]);

  startSession('barrier-lens');

  const BARRIER_PROMPT = `Du bist ein Reflexionspartner. Jemand hat dir gerade seine Vision für die Schule erzählt. Deine Aufgabe: hör genau hin und spiegel zurück, was du wahrnimmst — dann benenne mögliche Hindernisse.

Sprich die Person IMMER mit "du" an, nie mit "Sie". Schreibe aus DEINER Perspektive — "ich höre...", "was ich wahrnehme...". Beziehe dich auf konkrete Formulierungen, nicht auf Abstraktes. Keine Floskeln, keine Wiederholung.

Ordne die Hindernisse den drei Ebenen zu (nach Gkrimpizi et al., 2023):
- **teacher-level**: Kompetenzen, Haltungen, Unsicherheit einzelner Lehrpersonen
- **school-level**: Führung, Vision, Strukturen, Zusammenarbeit im Team
- **system-level**: Infrastruktur, Finanzierung, rechtliche Rahmenbedingungen, externer Support

Antworte IMMER als reines JSON:
{
  "analysis": "2-3 Sätze in DU-Form, die zurückspiegeln was du gehört hast. Beginne z.B. mit 'Ich höre bei dir...', 'Du beschreibst...', 'Was bei dir mitschwingt...'. Warm, konkret, persönlich.",
  "barriers": [
    {
      "level": "teacher-level|school-level|system-level",
      "topicId": "topic-id-from-compass",
      "reason": "EIN Satz in DU-Form, der sich auf etwas Konkretes bezieht, das du gerade gehört hast. Z.B. 'Du sprichst davon, dass...' oder 'Ich höre, dass dir...'. Keine abstrakten Begründungen, kein 'die Lehrperson', kein 'die Schule'."
    }
  ]
}

Verwende NUR diese Topic-IDs:
Personen: personal-social-skills, professional-skills-media-cs, specialised-didactics-media-cs, media-didactics, application-skills-teachers, mindsets, parent-participation
Unterricht: learning-culture, interdisciplinary-skills, assessment, teaching-learning-units, learning-platforms-tools, media-cs-curriculum, media-education-rules, class-administration
Organisation: vision, structures-processes, concept, support, leadership, learning-spaces, innovation, public-relations
Team: cooperation, knowledge-management, communication, team-culture, dynamics-emotions
Infrastruktur: working-devices, basic-infrastructure, software-services, security, services, legal-aspects, funding, artificial-intelligence

Nenne 4-8 Hindernisse, verteilt auf mindestens 2 Ebenen. Antworte in der Sprache der Vision.`;

  async function handleVisionSubmit(text) {
    visionText = text;
    setVision(text);
    step = 'analysis';
    analyzing = true;

    try {
      const startTime = Date.now();
      const response = await chat([
        { role: 'system', content: BARRIER_PROMPT },
        { role: 'user', content: text },
      ], { temperature: 0.5, max_tokens: 1024 });

      const raw = response.choices?.[0]?.message?.content ?? '';
      addAiInteraction({
        promptTemplate: 'barrier-analysis-v1',
        model: response.model || 'unknown',
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
        latencyMs: Date.now() - startTime,
      });

      try {
        aiAnalysis = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) aiAnalysis = JSON.parse(match[0]);
        else throw new Error('Could not parse AI response');
      }

      if (ttsEnabled && aiAnalysis?.analysis) {
        try {
          const audioBlob = await speak(aiAnalysis.analysis, {
            voice: $ttsVoice,
            speed: $ttsSpeed,
          });
          const url = URL.createObjectURL(audioBlob);
          const audio = new Audio(url);
          audio.play();
          audio.onended = () => URL.revokeObjectURL(url);
        } catch (ttsErr) {
          console.error('TTS error:', ttsErr);
        }
      }
    } catch (e) {
      console.error('Barrier analysis error:', e);
      aiAnalysis = {
        analysis: 'Analyse konnte nicht durchgeführt werden.',
        barriers: [],
        error: e.message,
      };
    } finally {
      analyzing = false;
    }
  }

  function startReflectionOn(barrier) {
    currentBarrier = {
      level: barrier.level,
      topicId: barrier.topicId,
      reason: barrier.reason,
      suggestedByAI: true,
      selectedByUser: true,
    };
    step = 'reflection';
  }

  function handleBarrierSelected(barrier) {
    startReflectionOn(barrier);
  }

  /** Persist a completed reflection and advance to the branch screen. */
  function finishBarrier(barrierReflections) {
    const topic = getTopic(currentBarrier.topicId);
    addBarrier({
      level: currentBarrier.level,
      topicId: currentBarrier.topicId,
      topicVersion: topic?.version ?? 1,
      selectedByUser: currentBarrier.selectedByUser,
      suggestedByAI: currentBarrier.suggestedByAI,
      reflections: barrierReflections,
    });
    reflections.push({
      level: currentBarrier.level,
      topicId: currentBarrier.topicId,
      responses: barrierReflections,
    });
    exploredTopicIds.push(currentBarrier.topicId);
    step = 'branch';
  }

  function handleBranchChoice(choice) {
    addBranchChoice({
      afterBarrierIndex: reflections.length - 1,
      offeredTopicIds: choice.offeredTopicIds || [],
      pickedTopicId: choice.topicId || null,
      pickedType: choice.type,
    });

    if (choice.type === 'wrap') {
      finishSession();
      return;
    }

    const topic = getTopic(choice.topicId);
    const level = inferLevel(topic?.dimension);
    startReflectionOn({
      level,
      topicId: choice.topicId,
      reason: choice.why || '',
    });
  }

  /** Map a dimension ID to a Gkrimpizi level for the badge colour. */
  function inferLevel(dimension) {
    if (dimension === 'people-skills') return 'teacher-level';
    if (dimension === 'infrastructure') return 'system-level';
    return 'school-level';
  }

  function handleEndNow() {
    markEndedEarly();
    finishSession();
  }

  function finishSession() {
    step = 'summary';
    finalizeSession();
    if (browser) {
      saveSession(getSessionSnapshot()).catch(console.error);
    }
  }

  function handleStartOver() {
    step = 'vision';
    visionText = '';
    aiAnalysis = null;
    currentBarrier = null;
    reflections = [];
    exploredTopicIds = [];
    startSession('barrier-lens');
  }

  const remainingBarriers = $derived(
    (aiAnalysis?.barriers || []).filter((b) => !exploredTopicIds.includes(b.topicId))
  );
</script>

<svelte:head>
  <title>{$t('app.title')}</title>
</svelte:head>

<div class="main-page">
  <div class="tts-bar">
    <label class="auto-send-toggle" title={$t('chat.autoSendHint')}>
      <input type="checkbox" bind:checked={$autoSend} />
      <span>{$t('chat.autoSendLabel')}</span>
    </label>
    <button class="tts-toggle" onclick={() => ttsEnabled = !ttsEnabled}
      title={ttsEnabled ? $t('chat.ttsOff') : $t('chat.ttsOn')}>
      {ttsEnabled ? '🔊' : '🔇'}
    </button>
    <VoiceSettings />
  </div>

  {#if step === 'vision'}
    <div class="welcome">
      <h2>{$t('chat.welcome')}</h2>
      <p class="intro">{$t('chat.intro')}</p>
      <p class="disclaimer">{$t('chat.disclaimer')}</p>
    </div>
    <BarrierVision onsubmit={handleVisionSubmit} />
  {:else if step === 'analysis'}
    <BarrierSelect
      {analyzing}
      analysis={aiAnalysis}
      onselect={handleBarrierSelected}
    />
  {:else if step === 'reflection' && currentBarrier}
    <BarrierReflect
      barrier={currentBarrier}
      vision={visionText}
      {ttsEnabled}
      ondone={finishBarrier}
      onendnow={handleEndNow}
    />
  {:else if step === 'branch'}
    <BarrierBranch
      vision={visionText}
      lastBarrier={currentBarrier}
      {exploredTopicIds}
      {remainingBarriers}
      onpick={handleBranchChoice}
      onendnow={handleEndNow}
    />
  {:else if step === 'summary'}
    <BarrierSummary
      vision={visionText}
      {reflections}
      onrestart={handleStartOver}
    />
  {/if}
</div>

<style>
  .main-page {
    max-width: 700px;
    margin: 0 auto;
    padding: 24px 16px;
  }
  .welcome {
    text-align: center;
    padding: 24px 0 8px;
  }
  .welcome h2 {
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .intro {
    font-size: 16px;
    line-height: 1.6;
    color: var(--text);
    max-width: 560px;
    margin: 0 auto 10px;
  }
  .disclaimer {
    font-size: 13px;
    color: var(--text-light);
    font-style: italic;
    margin-bottom: 16px;
  }
  .tts-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-bottom: 8px;
  }
  .auto-send-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-light);
    cursor: pointer;
    user-select: none;
  }
  .auto-send-toggle input {
    margin: 0;
    cursor: pointer;
  }
  .auto-send-toggle:hover { color: var(--text); }
  .tts-toggle {
    border: none;
    background: none;
    font-size: 18px;
    padding: 4px 8px;
    opacity: 0.6;
    transition: opacity 0.15s;
    cursor: pointer;
  }
  .tts-toggle:hover { opacity: 1; }
</style>
