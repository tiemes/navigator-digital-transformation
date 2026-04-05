<!--
  BarrierReflect.svelte — Voice-first reflection step for one barrier/topic.
  Shows 2-3 questions from the selected topic as a spoken interview.
  AI reads question aloud via TTS, user responds by voice, AI gives follow-up.

  Props:
    barrier — { level, topicId, reason }
    index — current barrier index (0-based)
    total — total number of selected barriers
    ttsEnabled — whether TTS is active
    ondone(responses[]) — called when all questions for this barrier are answered

  Used by: +page.svelte (barrier flow)
-->
<script>
  import { lang, t } from '$lib/i18n';
  import { getTopic, topicName } from '$lib/data.js';
  import { chat, speak } from '$lib/api.js';
  import VoiceButton from './VoiceButton.svelte';

  let { barrier, index, total, ttsEnabled = false, ondone } = $props();
  let currentQ = $state(0);
  let response = $state('');
  let responses = $state([]);
  let showTextarea = $state(false);
  let speaking = $state(false);
  let followUp = $state('');
  let loadingFollowUp = $state(false);

  let voiceButtonRef = $state(null);

  const topic = $derived(getTopic(barrier.topicId));
  const questions = $derived(topic?.questions?.slice(0, 3) || []);
  const questionText = $derived(
    questions[currentQ]?.i18n?.[$lang] || questions[currentQ]?.i18n?.de || ''
  );

  const levelColors = {
    'teacher-level': 'var(--people)',
    'school-level': 'var(--organisation)',
    'system-level': 'var(--infrastructure)',
  };

  /** Speak text via TTS and auto-activate mic when done */
  async function speakAndListen(text) {
    if (!ttsEnabled || !text) return;
    speaking = true;
    try {
      const audioBlob = await speak(text);
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        speaking = false;
        // Auto-activate mic after TTS finishes
        setTimeout(() => voiceButtonRef?.startRecording(), 300);
      };
      audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      speaking = false;
    }
  }

  /** Speak current question when it changes */
  $effect(() => {
    if (questionText && currentQ >= 0) {
      followUp = '';
      speakAndListen(questionText);
    }
  });

  function handleTranscript(transcript) {
    response = response ? `${response} ${transcript}` : transcript;
  }

  /** Get a brief AI follow-up after user responds */
  async function getFollowUp(userResponse) {
    loadingFollowUp = true;
    try {
      const prompt = `Du bist ein empathischer Reflexionsbegleiter. Eine Lehrperson reflektiert über "${topicName(barrier.topicId, $lang)}". Die Frage war: "${questionText}". Die Antwort war: "${userResponse}". Gib eine kurze wertschätzende Rückmeldung (1-2 Sätze) und leite zur nächsten Frage über. Antworte in der Sprache der Antwort.`;
      const res = await chat(
        [{ role: 'system', content: prompt }],
        { temperature: 0.7, max_tokens: 150 }
      );
      const text = res.choices?.[0]?.message?.content ?? '';
      followUp = text;
      if (ttsEnabled && text) {
        speakAndListen(text);
      }
    } catch (err) {
      console.error('Follow-up error:', err);
    } finally {
      loadingFollowUp = false;
    }
  }

  function submitResponse(skipped = false) {
    const userResponse = skipped ? null : response.trim() || null;
    responses.push({
      questionId: questions[currentQ]?.id || `q-${currentQ}`,
      questionVersion: questions[currentQ]?.version || 1,
      response: userResponse,
      skipped,
      timestamp: new Date().toISOString(),
    });

    if (!skipped && userResponse) {
      getFollowUp(userResponse);
    }

    response = '';
    showTextarea = false;
  }

  function advanceQuestion() {
    followUp = '';
    if (currentQ < questions.length - 1) {
      currentQ++;
    } else {
      ondone([...responses]);
      currentQ = 0;
      responses = [];
    }
  }

  // Reset when barrier changes
  $effect(() => {
    if (barrier) {
      currentQ = 0;
      response = '';
      responses = [];
      followUp = '';
      showTextarea = false;
    }
  });
</script>

<div class="reflect-step">
  <div class="progress">
    <span class="badge" style="background: {levelColors[barrier.level]}">
      {topicName(barrier.topicId, $lang)}
    </span>
    <span class="counter">
      {$t('barriers.reflectionTitle')} {index + 1}/{total}
    </span>
  </div>

  {#if barrier.reason}
    <p class="reason">{barrier.reason}</p>
  {/if}

  {#if questions[currentQ]}
    <div class="question-card">
      <p class="question-number">{currentQ + 1}/{questions.length}</p>
      <p class="question-text">{questionText}</p>

      {#if speaking}
        <div class="speaking-indicator">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        </div>
      {/if}

      {#if !followUp}
        <div class="voice-area">
          <VoiceButton
            bind:this={voiceButtonRef}
            large={true}
            ontranscript={handleTranscript}
            onsend={() => { if (response.trim()) submitResponse(false); }}
            autoSend={true}
            disabled={speaking}
          />
        </div>

        {#if response && !showTextarea}
          <div class="transcript-preview">
            <p>{response}</p>
            <div class="preview-actions">
              <button class="btn-edit" onclick={() => showTextarea = true}>
                ✏️
              </button>
              <button class="btn-primary" onclick={() => submitResponse(false)}>
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
          <form class="text-fallback" onsubmit={(e) => { e.preventDefault(); submitResponse(false); }}>
            <textarea
              bind:value={response}
              placeholder={$t('topic.notes')}
              rows="3"
            ></textarea>
            <button type="submit" class="btn-primary" disabled={!response.trim()}>
              {$t('barriers.continue')}
            </button>
          </form>
        {/if}

        <button class="btn-skip" onclick={() => { submitResponse(true); advanceQuestion(); }}>
          {$t('barriers.skipQuestion')}
        </button>
      {:else}
        <!-- AI follow-up shown, user advances -->
        <div class="follow-up">
          <p>{followUp}</p>
        </div>
        <button class="btn-primary" onclick={advanceQuestion}>
          {#if currentQ < questions.length - 1}
            {$t('pulse.next')}
          {:else}
            {$t('barriers.nextBarrier')}
          {/if}
        </button>
      {/if}

      {#if loadingFollowUp}
        <p class="loading-text">{$t('chat.thinking')}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .reflect-step { text-align: left; }
  .progress {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
  }
  .counter {
    font-size: 13px;
    color: var(--text-light);
  }
  .reason {
    font-size: 14px;
    color: var(--text-light);
    line-height: 1.5;
    margin-bottom: 20px;
    font-style: italic;
  }
  .question-card {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
  }
  .question-number {
    font-size: 12px;
    color: var(--text-light);
    margin-bottom: 8px;
  }
  .question-text {
    font-size: 18px;
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 24px;
  }
  .voice-area {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }
  .speaking-indicator {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-bottom: 16px;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-light);
    animation: bounce 1.2s ease-in-out infinite;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }
  .transcript-preview {
    background: #f0f4f8;
    border-radius: 12px;
    padding: 16px;
    margin: 0 auto 12px;
    max-width: 480px;
    text-align: left;
  }
  .transcript-preview p {
    font-size: 15px;
    line-height: 1.5;
    margin-bottom: 12px;
  }
  .preview-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .btn-edit {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    font-size: 14px;
    cursor: pointer;
  }
  .link-btn {
    background: none;
    border: none;
    color: var(--text-light);
    font-size: 14px;
    cursor: pointer;
    text-decoration: underline;
    padding: 8px;
    display: block;
    margin: 0 auto 12px;
  }
  .link-btn:hover { color: var(--text); }
  .text-fallback {
    max-width: 480px;
    margin: 0 auto 12px;
  }
  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    font-family: inherit;
  }
  textarea:focus {
    outline: none;
    border-color: var(--text);
  }
  .follow-up {
    background: #f0f4f8;
    border-radius: 12px;
    padding: 16px;
    margin: 0 auto 16px;
    max-width: 480px;
    text-align: left;
  }
  .follow-up p {
    font-size: 15px;
    line-height: 1.6;
    color: var(--text);
  }
  .loading-text {
    font-size: 13px;
    color: var(--text-light);
    margin-top: 8px;
  }
  .btn-skip {
    display: block;
    margin: 8px auto 0;
    padding: 8px 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    font-size: 14px;
    color: var(--text-light);
    cursor: pointer;
  }
  .btn-primary {
    padding: 10px 32px;
    border: none;
    border-radius: 8px;
    background: var(--text);
    color: #fff;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 12px;
  }
  .btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
