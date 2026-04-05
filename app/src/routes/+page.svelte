<!--
  +page.svelte — Primary landing page.
  Welcome intro → vision prompt → AI barrier analysis → deeper reflection → summary.
  The vision is the main starting point of the Navigator.
-->
<script>
  import { lang, t } from '$lib/i18n';
  import { chat, speak } from '$lib/api.js';
  import { getTopic, topicName, getTopicsByDimension } from '$lib/data.js';
  import { session, startSession, setVision, addBarrier, addAiInteraction, finalizeSession, getSessionSnapshot } from '$lib/stores/session.js';
  import { saveSession } from '$lib/stores/db.js';
  import { browser } from '$app/environment';
  import BarrierVision from '$lib/components/BarrierVision.svelte';
  import BarrierSelect from '$lib/components/BarrierSelect.svelte';
  import BarrierReflect from '$lib/components/BarrierReflect.svelte';
  import BarrierSummary from '$lib/components/BarrierSummary.svelte';

  /** @type {'vision' | 'analysis' | 'reflection' | 'summary'} */
  let step = $state('vision');
  let visionText = $state('');
  let analyzing = $state(false);
  let ttsEnabled = $state(true);
  let aiAnalysis = $state(null);
  let selectedBarriers = $state([]);
  let currentBarrierIndex = $state(0);
  let reflections = $state([]);

  // Start a fresh barrier-lens session
  startSession('barrier-lens');

  const BARRIER_PROMPT = `Du bist ein Analysepartner für Schulentwicklung im digitalen Wandel. Eine Lehrperson oder Schulleitung hat eine Vision für ihre Schule beschrieben. Deine Aufgabe ist es, mögliche Hindernisse zu identifizieren, die dieser Vision im Weg stehen könnten.

Ordne die Hindernisse den drei Ebenen zu (nach Gkrimpizi et al., 2023):
- **teacher-level**: Kompetenzen, Haltungen, Unsicherheit einzelner Lehrpersonen
- **school-level**: Führung, Vision, Strukturen, Zusammenarbeit im Team
- **system-level**: Infrastruktur, Finanzierung, rechtliche Rahmenbedingungen, externer Support

Antworte IMMER als JSON mit genau diesem Format:
{"analysis": "2-3 Sätze, die die Vision wertschätzend zusammenfassen", "barriers": [{"level": "teacher-level|school-level|system-level", "topicId": "topic-id-from-compass", "reason": "Kurze Begründung"}]}

Verwende NUR diese Topic-IDs:
Personen: personal-social-skills, professional-skills-media-cs, specialised-didactics-media-cs, media-didactics, application-skills-teachers, mindsets, parent-participation
Unterricht: learning-culture, interdisciplinary-skills, assessment, teaching-learning-units, learning-platforms-tools, media-cs-curriculum, media-education-rules, class-administration
Organisation: vision, structures-processes, concept, support, leadership, learning-spaces, innovation, public-relations
Team: cooperation, knowledge-management, communication, team-culture, dynamics-emotions
Infrastruktur: working-devices, basic-infrastructure, software-services, security, services, legal-aspects, funding, artificial-intelligence

Nenne 4-8 Hindernisse, verteilt auf mindestens 2 Ebenen. Antworte in der Sprache der Vision. Sei wertschätzend.`;

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
      const latencyMs = Date.now() - startTime;

      addAiInteraction({
        promptTemplate: 'barrier-analysis-v1',
        model: response.model || 'unknown',
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
        latencyMs,
      });

      try {
        aiAnalysis = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          aiAnalysis = JSON.parse(match[0]);
        } else {
          throw new Error('Could not parse AI response');
        }
      }

      // TTS: read analysis aloud if enabled
      if (ttsEnabled && aiAnalysis?.analysis) {
        try {
          const audioBlob = await speak(aiAnalysis.analysis);
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

  function handleBarriersSelected(barriers) {
    selectedBarriers = barriers;
    currentBarrierIndex = 0;
    reflections = barriers.map((b) => ({
      ...b,
      selectedByUser: true,
      suggestedByAI: true,
      responses: [],
    }));
    step = 'reflection';
  }

  function handleReflectionDone(barrierReflections) {
    reflections[currentBarrierIndex].responses = barrierReflections;

    addBarrier({
      level: reflections[currentBarrierIndex].level,
      topicId: reflections[currentBarrierIndex].topicId,
      topicVersion: getTopic(reflections[currentBarrierIndex].topicId)?.version || 1,
      selectedByUser: true,
      suggestedByAI: true,
      reflections: barrierReflections,
    });

    if (currentBarrierIndex < selectedBarriers.length - 1) {
      currentBarrierIndex++;
    } else {
      step = 'summary';
      finalizeSession();
      if (browser) {
        saveSession(getSessionSnapshot()).catch(console.error);
      }
    }
  }

  function handleStartOver() {
    step = 'vision';
    visionText = '';
    aiAnalysis = null;
    selectedBarriers = [];
    currentBarrierIndex = 0;
    reflections = [];
    startSession('barrier-lens');
  }
</script>

<svelte:head>
  <title>{$t('app.title')}</title>
</svelte:head>

<div class="main-page">
  <div class="tts-bar">
    <button class="tts-toggle" onclick={() => ttsEnabled = !ttsEnabled}
      title={ttsEnabled ? $t('chat.ttsOff') : $t('chat.ttsOn')}>
      {ttsEnabled ? '🔊' : '🔇'}
    </button>
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
      onselect={handleBarriersSelected}
    />
  {:else if step === 'reflection'}
    <BarrierReflect
      barrier={selectedBarriers[currentBarrierIndex]}
      index={currentBarrierIndex}
      total={selectedBarriers.length}
      {ttsEnabled}
      ondone={handleReflectionDone}
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
    justify-content: flex-end;
    margin-bottom: 8px;
  }
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
