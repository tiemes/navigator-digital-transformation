<!--
  BarrierReflect.svelte — Deeper reflection step for one barrier/topic.
  Shows 2-3 questions from the selected topic, one at a time.
  User writes free-text responses or skips.

  Props:
    barrier — { level, topicId, reason }
    index — current barrier index (0-based)
    total — total number of selected barriers
    ondone(responses[]) — called when all questions for this barrier are answered

  Used by: barriers/+page.svelte
-->
<script>
  import { lang, t } from '$lib/i18n';
  import { getTopic, topicName } from '$lib/data.js';

  let { barrier, index, total, ondone } = $props();
  let currentQ = $state(0);
  let response = $state('');
  let responses = $state([]);

  const topic = $derived(getTopic(barrier.topicId));
  const questions = $derived(topic?.questions?.slice(0, 3) || []);

  const levelColors = {
    'teacher-level': 'var(--people)',
    'school-level': 'var(--organisation)',
    'system-level': 'var(--infrastructure)',
  };

  function submitResponse(skipped = false) {
    responses.push({
      questionId: questions[currentQ]?.id || `q-${currentQ}`,
      questionVersion: questions[currentQ]?.version || 1,
      response: skipped ? null : response.trim() || null,
      skipped,
      timestamp: new Date().toISOString(),
    });

    response = '';

    if (currentQ < questions.length - 1) {
      currentQ++;
    } else {
      ondone([...responses]);
      // Reset for next barrier
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
      <p class="question-number">
        {currentQ + 1}/{questions.length}
      </p>
      <p class="question-text">
        {questions[currentQ].i18n?.[$lang] || questions[currentQ].i18n?.de || ''}
      </p>

      <textarea
        bind:value={response}
        placeholder={$t('topic.notes')}
        rows="4"
      ></textarea>

      <div class="actions">
        <button class="btn-skip" onclick={() => submitResponse(true)}>
          {$t('barriers.skipQuestion')}
        </button>
        <button
          class="btn-primary"
          onclick={() => submitResponse(false)}
        >
          {#if currentQ < questions.length - 1}
            {$t('pulse.next')}
          {:else}
            {$t('barriers.nextBarrier')}
          {/if}
        </button>
      </div>
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
    margin-bottom: 20px;
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
  .actions {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
  }
  .btn-skip {
    padding: 8px 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    font-size: 14px;
    color: var(--text-light);
    cursor: pointer;
  }
  .btn-primary {
    padding: 8px 24px;
    border: none;
    border-radius: 8px;
    background: var(--text);
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }
</style>
