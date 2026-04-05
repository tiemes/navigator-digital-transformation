<!--
  Header.svelte — App header with title, language switcher, and mode buttons.
  Sticky at top. Controls language via the i18n store.

  Used by: +layout.svelte
-->
<script>
  import { lang, t } from '$lib/i18n';
  import '$lib/stores/settings.js';

  function setLanguage(newLang) {
    lang.set(newLang);
  }
</script>

<header class="header">
  <h1>{$t('app.title')}</h1>
  <div class="controls">
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
  h1 { font-size: 18px; font-weight: 600; }
  .controls { display: flex; gap: 8px; align-items: center; }
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
