<script lang="ts">
  import '../styles/app.scss';
</script>

<main>
  <slot />
</main>

<footer>@ 2021 Kota Yatagai</footer>

<style lang="scss">
  main {
    margin: 0 auto;
    width: 85%;
  }
  footer {
    width: 100vw;
    text-align: center;
    padding-bottom: 10px;
  }
</style>
