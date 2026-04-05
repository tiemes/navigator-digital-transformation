<!--
  +layout.svelte — Root layout shell.
  Renders header, page content, and footer.
  Imports global styles.
-->
<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import '../app.css';

  let { children } = $props();
</script>

<svelte:head>
  <meta name="description" content="Navigator Digitaler Wandel — Selbstreflexion für Schulen" />
</svelte:head>

<Header />

<main class="container">
  {@render children()}
</main>

<Footer />
