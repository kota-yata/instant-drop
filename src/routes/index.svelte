<script lang="ts">
  import LeftData from '$lib/components/sections/left-data.svelte';
  import LeftHeader from '$lib/components/sections/left-header.svelte';
  import LeftPeers from '$lib/components/sections/left-peers.svelte';
  import RightInfo from '$lib/components/sections/right-info.svelte';
  import RightLog from '$lib/components/sections/right-log.svelte';
  import { RTC } from '$lib/rtc';
  import { WS } from '$lib/ws';
  import { onMount } from 'svelte';
  import '../styles/app.scss';

  let ws: WS;
  onMount(() => {
    ws = new WS();
  });
</script>

<svelte:head>
  <title>Home | Instant Drop</title>
</svelte:head>

<div class="index">
  <div class="left">
    <LeftHeader />
    <LeftPeers {ws} />
    <LeftData />
  </div>
  <div class="right">
    <RightLog />
    <RightInfo />
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
</style>
