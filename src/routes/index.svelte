<script lang="ts">
  import LeftData from '$lib/components/sections/left-data.svelte';
  import LeftHeader from '$lib/components/sections/left-header.svelte';
  import LeftPeers from '$lib/components/sections/left-peers.svelte';
  import RightLog from '$lib/components/sections/right-log.svelte';
  import { WS } from '$lib/ws';
  import { onMount } from 'svelte';
  import '../styles/app.scss';

  let ws: WS;
  onMount(() => {
    ws = new WS();
  });
</script>

<div class="index">
  <div class="left">
    <LeftHeader />
    <LeftPeers {ws} />
    <LeftData />
  </div>
  <div class="right">
    <RightLog />
  </div>
</div>

<style lang="scss">
  @import '../styles/variable.scss';

  .index {
    width: calc(100vw - #{$container-mp * 2});
    height: calc(100vh - #{$container-mp * 2});
    padding: $container-mp;
    display: flex;
    justify-content: space-between;
    & > .left {
      width: 60%;
    }
    & > .right {
      width: 40%;
      display: flex;
      flex-direction: column; // In order to avoid collapsing margins
    }
  }

  @media screen and (max-width: 700px) {
    .index {
      display: block;
      & > .left {
        width: 100%;
      }
      & > .right {
        width: 100%;
      }
    }
  }
</style>
