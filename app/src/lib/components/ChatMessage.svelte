<!--
  ChatMessage.svelte — Single chat message bubble.
  Renders user or assistant messages with different styling.
  Assistant messages may contain inline topic suggestions.

  Props: message ({ role, content, topics? })
  Used by: +page.svelte (conversation view)
-->
<script>
  import { lang } from '$lib/i18n';
  import { getTopic, getDimension } from '$lib/data.js';

  let { message } = $props();

  let isUser = $derived(message.role === 'user');
</script>

<div class="message" class:user={isUser} class:assistant={!isUser}>
  <div class="bubble">
    <p class="content">{message.content}</p>
  </div>

  {#if message.topics?.length > 0}
    <div class="topic-suggestions">
      {#each message.topics as topicId}
        {@const topic = getTopic(topicId)}
        {@const dim = topic ? getDimension(topic.dimension) : null}
        {#if topic && dim}
          <a class="topic-chip" href="/topic/{topicId}" style="background: {dim.color}">
            {topic.number}. {topic.i18n[$lang]?.name ?? topicId}
          </a>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .message { margin-bottom: 16px; max-width: 720px; }
  .message.user { margin-left: auto; }
  .message.assistant { margin-right: auto; }
  .bubble {
    padding: 14px 18px;
    border-radius: var(--radius);
    line-height: 1.6;
    font-size: 15px;
  }
  .user .bubble {
    background: var(--text);
    color: #fff;
    border-bottom-right-radius: 4px;
    margin-left: 48px;
  }
  .assistant .bubble {
    background: var(--card-bg);
    box-shadow: var(--shadow);
    border-bottom-left-radius: 4px;
    margin-right: 48px;
  }
  .content { white-space: pre-wrap; }
  .topic-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
    margin-right: 48px;
  }
  .topic-chip {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    color: #fff;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.15s;
  }
  .topic-chip:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    text-decoration: none;
  }
</style>
