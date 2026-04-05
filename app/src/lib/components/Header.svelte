<!--
  Header.svelte — App header with title, nav links, and language switcher.
  Sticky at top. Controls language via the i18n store.

  Used by: +layout.svelte
-->
<script>
  import { lang, t } from '$lib/i18n';
  import '$lib/stores/settings.js';
  import { page } from '$app/state';

  function setLanguage(newLang) {
    lang.set(newLang);
  }
</script>

<header class="header">
  <a href="/" class="title">{$t('app.title')}</a>
  <div class="controls">
    <a href="/explore" class="nav-link" class:active={page.url?.pathname === '/explore'}>
      {$t('nav.explore')}
    </a>
    <span class="divider">|</span>
    <button
      class="lang-btn"
      class:active={$lang === 'de'}
      onclick={() => setLanguage('de')}
    >DE</button>
    <button
      class="lang-btn"
      class:active={$lang === 'en'}
      onclick={() => setLanguage('en')}
    >EN</button>
  </div>
</header>

<style>
  .header {
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .title {
    font-size: 18px;
    font-weight: 600;
    text-decoration: none;
    color: inherit;
  }
  .title:hover { text-decoration: none; }
  .controls { display: flex; gap: 8px; align-items: center; }
  .nav-link {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-light);
    text-decoration: none;
    padding: 4px 8px;
  }
  .nav-link:hover { color: var(--text); text-decoration: none; }
  .nav-link.active { color: var(--text); font-weight: 600; }
  .divider { color: #ddd; font-size: 13px; }
  .lang-btn {
    padding: 4px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    font-size: 13px;
  }
  .lang-btn.active {
    background: var(--text);
    color: #fff;
    border-color: var(--text);
  }
</style>
