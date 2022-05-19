<script lang="ts">
  import type { RTC } from '$lib/rtc';
  import { idStore, LogListStore, logStore, peersStore } from '$lib/store';
  import type { messageObject, offerObject, peer } from '$lib/types';
  import { onDestroy, onMount } from 'svelte';
  import Icon from '../icon.svelte';
  import { supported } from 'browser-fs-access';
  import type { WS } from '$lib/ws';

  export let ws: WS;
  export let rtc: RTC;

  const logListStore = new LogListStore(logStore);

  $: filteredPeers = [] as peer[];
  const unsub = peersStore.subscribe((peers) => {
    filteredPeers = peers.filter((peer) => peer.id !== $idStore);
  })
  onDestroy(() => {
    unsub();
  });

  onMount(() => {
    if (supported) {
      logListStore.pushWithCurrentTimeStamp('File System Access API is supported');
    } else {
      logListStore.pushWithCurrentTimeStamp('File System Access API is not supported');
    }
  })

  const peerOnClick = async (id: string) => {
    const sdp = await rtc.createOffer();
    const offerObj: offerObject = {
      from: $idStore,
      to: id,
      offer: JSON.stringify(sdp)
    }
    const messageObj: messageObject = {
      dataType: 'Offer',
      stringData: JSON.stringify(offerObj),
      log: '',
      timeStamp: ''
    };
    ws.sendMessage(JSON.stringify(messageObj));
  }
</script>

<div class="left-peers">
  {#if filteredPeers.length > 0}
    {#each filteredPeers as peer}
      <div class="peer" role="button" on:click="{() => { peerOnClick(peer.id) }}">
        <Icon iconString={peer.icon} />
        <h2>{peer.id}</h2>
      </div>
    {/each}
  {:else}
    <h2>Searching peers nearby...</h2>
  {/if}
</div>

<style lang="scss">
  @import '../../../styles/variable.scss';

  .left-peers {
    height: calc(50% - #{$container-mp});
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    overflow-y: auto;
    & > .peer {
      cursor: pointer;
      width: 100px;
      margin: 20px;
      font-size: 35px;
      text-align: center;
      & > h2 {
        margin-top: 10px;
      }
    }
  }
</style>
