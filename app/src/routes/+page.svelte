<!--
  +page.svelte — Conversational landing page.
  Welcome intro → open prompt → AI conversation with inline topic suggestions.
  Primary interaction mode for the Navigator.
-->
<script>
  import { lang, t } from '$lib/i18n';
  import { chat, speak } from '$lib/api.js';
  import { browser } from '$app/environment';
  import ChatMessage from '$lib/components/ChatMessage.svelte';
  import ChatInput from '$lib/components/ChatInput.svelte';
  import { startSession, addMessage, addAiInteraction, markVoiceUsed, finalizeSession, getSessionSnapshot } from '$lib/stores/session.js';
  import { saveSession } from '$lib/stores/db.js';

  // Start a fresh conversation session
  startSession('conversation');

  /** @type {Array<{role: string, content: string, topics?: string[]}>} */
  let messages = $state([]);
  let loading = $state(false);
  let ttsEnabled = $state(false);
  let chatArea = $state(null);

  // Load the system prompt for the LLM
  const SYSTEM_PROMPT = `Du bist ein Reflexionspartner für Lehrpersonen und Schulleitungen, die über den digitalen Wandel an ihrer Schule nachdenken. Du basierst auf dem «Kompass Digitaler Wandel» der PH Zürich mit 5 Dimensionen und 35 Themen.

Deine Rolle:
- Du bist ein aufmerksamer Zuhörer und Gesprächspartner, kein Experte oder Berater
- Du stellst offene Fragen, die zum Nachdenken anregen
- Du bewertest und beurteilst NIEMALS — du förderst Selbstreflexion
- Du antwortest in der Sprache, in der die Person schreibt

Antworte IMMER als JSON mit genau diesem Format:
{"message": "Dein Gesprächsbeitrag hier...", "topics": ["topic-id-1"]}

Das topics-Array enthält 0-3 IDs der relevanten Kompass-Themen:
Dimension 1 (Personen): personal-social-skills, professional-skills-media-cs, specialised-didactics-media-cs, media-didactics, application-skills-teachers, mindsets, parent-participation
Dimension 2 (Unterricht): learning-culture, interdisciplinary-skills, assessment, teaching-learning-units, learning-platforms-tools, media-cs-curriculum, media-education-rules, class-administration
Dimension 3 (Organisation): vision, structures-processes, concept, support, leadership, learning-spaces, innovation, public-relations
Dimension 4 (Team): cooperation, knowledge-management, communication, team-culture, dynamics-emotions
Dimension 5 (Infrastruktur): working-devices, basic-infrastructure, software-services, security, services, legal-aspects, funding, artificial-intelligence

Halte deine Antworten kurz (2-4 Sätze + eine Frage). Nenne maximal 2-3 Themen pro Antwort. Zwinge keine Themen auf.`;

  function scrollToBottom() {
    if (browser && chatArea) {
      requestAnimationFrame(() => {
        chatArea.scrollTop = chatArea.scrollHeight;
      });
    }
  }

  async function handleSend(text) {
    // Add user message
    messages = [...messages, { role: 'user', content: text }];
    addMessage('user', text);
    loading = true;
    scrollToBottom();

    try {
      // Build messages array for LLM (system + conversation history)
      const llmMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const startTime = Date.now();
      const response = await chat(llmMessages, { temperature: 0.7, max_tokens: 512 });
      const raw = response.choices?.[0]?.message?.content ?? '';

      addAiInteraction({
        promptTemplate: 'conversation-v1',
        model: response.model || 'unknown',
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
        latencyMs: Date.now() - startTime,
      });

      // Parse structured JSON response
      let aiMessage = '';
      let topics = [];
      try {
        const parsed = JSON.parse(raw);
        aiMessage = parsed.message || raw;
        topics = parsed.topics || [];
      } catch {
        // If not valid JSON, use raw text
        aiMessage = raw;
      }

      messages = [...messages, { role: 'assistant', content: aiMessage, topics }];
      addMessage('assistant', aiMessage, topics);
      scrollToBottom();

      // TTS: read aloud if enabled
      if (ttsEnabled && aiMessage) {
        try {
          const audioBlob = await speak(aiMessage);
          const url = URL.createObjectURL(audioBlob);
          const audio = new Audio(url);
          audio.play();
          audio.onended = () => URL.revokeObjectURL(url);
        } catch (e) {
          console.error('TTS error:', e);
        }
      }
    } catch (e) {
      messages = [...messages, {
        role: 'assistant',
        content: `Error: ${e.message}`,
        topics: [],
      }];
      scrollToBottom();
    } finally {
      loading = false;
    }
  }

  function toggleTts() {
    ttsEnabled = !ttsEnabled;
  }
</script>

<svelte:head>
  <title>{$t('app.title')}</title>
</svelte:head>

<div class="conversation-page">
  {#if messages.length === 0}
    <!-- Welcome screen -->
    <div class="welcome">
      <h2>{$t('chat.welcome')}</h2>
      <p class="intro">{$t('chat.intro')}</p>
      <p class="disclaimer">{$t('chat.disclaimer')}</p>
    </div>
  {/if}

  <!-- Chat messages -->
  <div class="chat-area" bind:this={chatArea}>
    {#each messages as message, i (i)}
      <ChatMessage {message} />
    {/each}

    {#if loading}
      <div class="thinking">
        <span class="dot-pulse"></span>
        {$t('chat.thinking')}
      </div>
    {/if}
  </div>

  <!-- Input area -->
  <div class="input-area">
    <div class="input-controls">
      <button class="tts-toggle" onclick={toggleTts} title={ttsEnabled ? $t('chat.ttsOff') : $t('chat.ttsOn')}>
        {ttsEnabled ? '🔊' : '🔇'}
      </button>
    </div>
    <ChatInput onsend={handleSend} disabled={loading} />
  </div>
</div>

<style>
  .conversation-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 120px);
    max-width: 800px;
    margin: 0 auto;
  }
  .welcome {
    text-align: center;
    padding: 48px 24px 32px;
    flex-shrink: 0;
  }
  .welcome h2 {
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  .intro {
    font-size: 16px;
    line-height: 1.6;
    color: var(--text);
    max-width: 560px;
    margin: 0 auto 12px;
  }
  .disclaimer {
    font-size: 13px;
    color: var(--text-light);
    font-style: italic;
  }
  .chat-area {
    flex: 1;
    overflow-y: auto;
    padding: 16px 0;
  }
  .thinking {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-light);
    font-size: 14px;
    padding: 8px 0;
  }
  .dot-pulse {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-light);
    animation: pulse-dot 1.2s infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
  .input-area {
    flex-shrink: 0;
    padding: 12px 0 8px;
    border-top: 1px solid #e8e8e8;
  }
  .input-controls {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 6px;
  }
  .tts-toggle {
    border: none;
    background: none;
    font-size: 18px;
    padding: 4px 8px;
    opacity: 0.6;
    transition: opacity 0.15s;
  }
  .tts-toggle:hover { opacity: 1; }
</style>
