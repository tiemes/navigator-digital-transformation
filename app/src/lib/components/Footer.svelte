<!--
  Footer.svelte — App footer with attribution and license.

  Used by: +layout.svelte
-->
<script>
  import { t } from '$lib/i18n';
</script>

<footer class="footer">
  <p>
    {$t('footer.basedOn')}
    <a href="https://kompassdigitalerwandel.ch/" target="_blank" rel="noopener">
      {$t('footer.framework')}
    </a>
    {$t('footer.by')}
  </p>
  <p class="license">{$t('footer.license')}</p>
</footer>

<style>
  .footer {
    text-align: center;
    padding: 32px;
    color: var(--text-light);
    font-size: 12px;
  }
  .license { margin-top: 4px; }
  a { color: var(--text-light); }
</style>
