<script lang="ts">
  import { idStore, LogListStore, logStore, peersStore } from '$lib/store';
  import type { peer } from '$lib/types';
  import { onDestroy, onMount } from 'svelte';
  import Icon from '../icon.svelte';
  import { fileOpen, supported } from 'browser-fs-access';
  import type { WS } from '$lib/ws';
  import { RTC } from '$lib/rtc';
  import messageObject from '$lib/messageObject';
  import offerObject from '$lib/stringDataObject';

  export let ws: WS;

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
    let rtc: RTC;
    let r = ws.rtcInstanceList.find((r) => r.id === id);
    // If this is the first time connecting to the remote peer
    if (!r) {
      rtc = new RTC(ws, id);
      ws.rtcInstanceList.push({ id, rtc });
      const sdp = await rtc.createOffer();
      const offerObj = new offerObject($idStore, id, JSON.stringify(sdp)).toString();
      const messageObj = new messageObject('Offer', offerObj).toString();
      ws.sendMessage(messageObj);
    } else {
      rtc = r.rtc;
      logListStore.pushWithCurrentTimeStamp(`Connection with peer ID: ${id} has already been established`);
    }
    try {
      const blobs = await fileOpen({
        multiple: true
      });
      blobs.map(async (blob) => {
        const arrayBuffer = await blob.arrayBuffer();
        rtc.send(arrayBuffer);
        console.log('sent');
      })
    } catch(err) {
      if (err.name === 'AbortError') return;
      logListStore.pushWithCurrentTimeStamp('Something went wrong while opening files');
      console.error(err);
    };
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
