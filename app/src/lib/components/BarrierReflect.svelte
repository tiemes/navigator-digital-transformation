<!--
  BarrierReflect.svelte — Reflection on ONE barrier.
  1 seed question from navigator.json + up to 3 AI-generated follow-ups.
  Voice-first: TTS reads each question, mic auto-activates after.

  Props:
    barrier — { level, topicId, reason }
    vision — the user's vision statement (context for the follow-up AI)
    ttsEnabled — whether TTS is active
    ondone(responses[]) — called when reflection on this barrier is complete
    onendnow() — called when user clicks "Genug für heute"

  Used by: +page.svelte (barrier flow)
-->
<script>
  import { lang, t } from '$lib/i18n';
  import { getTopic, topicName } from '$lib/data.js';
  import { chat, speak } from '$lib/api.js';
  import { addAiInteraction } from '$lib/stores/session.js';
  import { autoSend, ttsVoice, ttsSpeed } from '$lib/stores/settings.js';
  import VoiceButton from './VoiceButton.svelte';

  let { barrier, vision = '', ttsEnabled = false, ondone, onendnow } = $props();

  const MAX_FOLLOW_UPS = 3;

  const topic = $derived(getTopic(barrier.topicId));

  /** The seed question from navigator.json (first question of the topic). */
  const seedQuestion = $derived(topic?.questions?.[0]);
  const seedText = $derived(
    seedQuestion?.i18n?.[$lang] || seedQuestion?.i18n?.de || ''
  );

  /**
   * Current question shown to the user.
   * { source: 'navigator' | 'ai-generated', id, version, text }
   */
  let current = $state(null);

  /** Accumulated reflection log (for the AI follow-up context). */
  let qaHistory = $state([]);

  /** Stored response records (what gets exported). */
  let responses = $state([]);

  /** Number of follow-up questions asked so far (seed is not counted). */
  let followUpCount = $state(0);

  let response = $state('');
  let showTextarea = $state(false);
  let speaking = $state(false);
  let loadingNext = $state(false);

  let voiceButtonRef = $state(null);

  const levelColors = {
    'teacher-level': 'var(--people)',
    'school-level': 'var(--organisation)',
    'system-level': 'var(--infrastructure)',
  };

  /** Speak text via TTS, auto-activate mic when done. */
  async function speakAndListen(text) {
    if (!ttsEnabled || !text) return;
    speaking = true;
    try {
      const audioBlob = await speak(text, { voice: $ttsVoice, speed: $ttsSpeed });
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        speaking = false;
        setTimeout(() => voiceButtonRef?.startRecording(), 300);
      };
      audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      speaking = false;
    }
  }

  /** Initialise with the seed question when a new barrier comes in. */
  $effect(() => {
    if (barrier && seedQuestion) {
      current = {
        source: 'navigator',
        id: seedQuestion.id,
        version: seedQuestion.version ?? 1,
        text: seedText,
      };
      qaHistory = [];
      responses = [];
      followUpCount = 0;
      response = '';
      showTextarea = false;
      speakAndListen(seedText);
    }
  });

  function handleTranscript(transcript) {
    response = response ? `${response} ${transcript}` : transcript;
  }

  /** Ask the AI whether to generate a follow-up, or stop. */
  async function askForFollowUp() {
    loadingNext = true;
    try {
      const qaRendered = qaHistory
        .map((t) => `F: ${t.q}\nA: ${t.a}`)
        .join('\n\n');

      const system = `Du bist ein empathischer Reflexionsbegleiter. Du sprichst mit einem Menschen über "${topicName(barrier.topicId, $lang)}" im Kontext seiner/ihrer Vision. Sprich zu dieser Person wie ein Mensch zu einem Menschen — direkt, neugierig, warm.

Vision der Person: "${vision}"

Bisheriger Dialog:
${qaRendered}

Regeln:
- Stelle NUR dann eine nächste Frage, wenn die letzte Antwort einen roten Faden hergibt (konkrete Situation, Emotion, Widerspruch, blinde Stelle).
- Die Frage ist DIREKT an die Person gerichtet — DU-Form, nie "die Lehrperson" oder ähnliches.
- Kurz: 1 Satz, ~15 Wörter. Konkret, offen, keine Floskel, keine Wiederholung.
- Keine Einleitung wie "Danke für die Antwort" — sofort die Frage.
- Max. ${MAX_FOLLOW_UPS} Vertiefungsfragen insgesamt. Bisher: ${followUpCount}/${MAX_FOLLOW_UPS}.
- Antworte in der Sprache der letzten Nutzerantwort.

Antworte als reines JSON:
{"done": false, "question": "..."}
oder
{"done": true, "reason": "..."}`;

      const startTime = Date.now();
      const res = await chat(
        [{ role: 'system', content: system }],
        { temperature: 0.6, max_tokens: 200 }
      );
      addAiInteraction({
        promptTemplate: 'follow-up-question-v1',
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
        parsed = match ? JSON.parse(match[0]) : { done: true };
      }

      if (parsed.done || !parsed.question) {
        ondone([...responses]);
        return;
      }

      followUpCount += 1;
      current = {
        source: 'ai-generated',
        id: `${barrier.topicId}-fu-${followUpCount}`,
        version: null,
        text: parsed.question,
      };
      speakAndListen(parsed.question);
    } catch (err) {
      console.error('Follow-up error:', err);
      ondone([...responses]);
    } finally {
      loadingNext = false;
    }
  }

  function recordAndContinue(skipped) {
    const userResponse = skipped ? null : response.trim() || null;
    responses.push({
      questionId: current.id,
      questionVersion: current.version,
      questionSource: current.source,
      questionText: current.text,
      response: userResponse,
      skipped,
      timestamp: new Date().toISOString(),
    });
    if (userResponse) {
      qaHistory.push({ q: current.text, a: userResponse });
    }
    response = '';
    showTextarea = false;

    if (followUpCount >= MAX_FOLLOW_UPS) {
      ondone([...responses]);
      return;
    }
    askForFollowUp();
  }

  function handleEnoughOnThis() {
    if (response.trim()) {
      recordAndContinue(false);
    } else {
      ondone([...responses]);
    }
  }
</script>

<div class="reflect-step">
  <div class="progress">
    <span class="badge" style="background: {levelColors[barrier.level]}">
      {topicName(barrier.topicId, $lang)}
    </span>
    <button class="end-now" onclick={onendnow} title={$t('barriers.endNowHint')}>
      {$t('barriers.endNow')}
    </button>
  </div>

  {#if barrier.reason}
    <p class="reason">{barrier.reason}</p>
  {/if}

  {#if current}
    <div class="question-card">
      {#if current.source === 'navigator'}
        <p class="question-label">{$t('topic.questions')}</p>
      {:else}
        <p class="question-label">↳ {followUpCount}/{MAX_FOLLOW_UPS}</p>
      {/if}
      <p class="question-text">{current.text}</p>

      {#if speaking || loadingNext}
        <div class="speaking-indicator">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        </div>
      {/if}

      {#if !loadingNext}
        <div class="voice-area">
          <VoiceButton
            bind:this={voiceButtonRef}
            large={true}
            ontranscript={handleTranscript}
            onsend={() => { if (response.trim()) recordAndContinue(false); }}
            autoSend={$autoSend}
            disabled={speaking}
          />
        </div>

        {#if response && !showTextarea}
          <div class="transcript-preview">
            <p>{response}</p>
            <div class="preview-actions">
              <button class="btn-edit" onclick={() => showTextarea = true}>✏️</button>
              <button class="btn-primary" onclick={() => recordAndContinue(false)}>
                {$t('barriers.continue')}
              </button>
            </div>
          </div>
        {/if}

        {#if !showTextarea && !response}
          <button class="link-btn" onclick={() => showTextarea = true}>
            {$t('barriers.orType')}
          </button>
        {/if}

        {#if showTextarea}
          <form class="text-fallback" onsubmit={(e) => { e.preventDefault(); recordAndContinue(false); }}>
            <textarea bind:value={response} placeholder={$t('topic.notes')} rows="3"></textarea>
            <button type="submit" class="btn-primary" disabled={!response.trim()}>
              {$t('barriers.continue')}
            </button>
          </form>
        {/if}

        <div class="secondary-actions">
          <button class="btn-skip" onclick={() => recordAndContinue(true)}>
            {$t('barriers.skipQuestion')}
          </button>
          <button class="btn-skip" onclick={handleEnoughOnThis}>
            {$t('barriers.enoughOnThis')}
          </button>
        </div>
      {:else}
        <p class="loading-text">{$t('barriers.thinkingFollowUp')}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .reflect-step { text-align: left; }
  .progress {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .badge {
    display: inline-block; padding: 4px 12px; border-radius: 20px;
    color: #fff; font-size: 13px; font-weight: 600;
  }
  .end-now {
    background: none; border: none; color: var(--text-light);
    font-size: 13px; cursor: pointer; padding: 4px 8px;
    text-decoration: underline;
  }
  .end-now:hover { color: var(--text); }
  .reason {
    font-size: 14px; color: var(--text-light); line-height: 1.5;
    margin-bottom: 20px; font-style: italic;
  }
  .question-card {
    background: #fff; border: 1px solid #e8e8e8; border-radius: 12px;
    padding: 24px; text-align: center;
  }
  .question-label {
    font-size: 12px; color: var(--text-light); margin-bottom: 8px;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .question-text {
    font-size: 18px; font-weight: 500; line-height: 1.5; margin-bottom: 24px;
  }
  .voice-area { display: flex; justify-content: center; margin-bottom: 16px; }
  .speaking-indicator {
    display: flex; justify-content: center; gap: 6px; margin-bottom: 16px;
  }
  .dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--text-light); animation: bounce 1.2s ease-in-out infinite;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }
  .transcript-preview {
    background: #f0f4f8; border-radius: 12px; padding: 16px;
    margin: 0 auto 12px; max-width: 480px; text-align: left;
  }
  .transcript-preview p { font-size: 15px; line-height: 1.5; margin-bottom: 12px; }
  .preview-actions { display: flex; justify-content: flex-end; gap: 8px; }
  .btn-edit {
    padding: 6px 12px; border: 1px solid #ddd; border-radius: 8px;
    background: #fff; font-size: 14px; cursor: pointer;
  }
  .link-btn {
    background: none; border: none; color: var(--text-light);
    font-size: 14px; cursor: pointer; text-decoration: underline;
    padding: 8px; display: block; margin: 0 auto 12px;
  }
  .link-btn:hover { color: var(--text); }
  .text-fallback { max-width: 480px; margin: 0 auto 12px; }
  textarea {
    width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;
    font-size: 14px; line-height: 1.5; resize: vertical; font-family: inherit;
  }
  textarea:focus { outline: none; border-color: var(--text); }
  .loading-text { font-size: 13px; color: var(--text-light); margin-top: 16px; }
  .secondary-actions {
    display: flex; gap: 12px; justify-content: center; margin-top: 8px;
  }
  .btn-skip {
    padding: 8px 16px; border: 1px solid #ddd; border-radius: 8px;
    background: #fff; font-size: 13px; color: var(--text-light); cursor: pointer;
  }
  .btn-skip:hover { border-color: var(--text); color: var(--text); }
  .btn-primary {
    padding: 10px 32px; border: none; border-radius: 8px;
    background: var(--text); color: #fff; font-size: 15px; font-weight: 500;
    cursor: pointer; margin-top: 12px;
  }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
