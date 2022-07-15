<script lang="ts">
  import { idStore, LogListStore, logStore, peersStore } from '$lib/store';
  import type { FragmentSet, Peer } from '$lib/types';
  import { onDestroy } from 'svelte';
  import Icon from '../icon.svelte';
  import type { WS } from '$lib/ws';
  import { RTC } from '$lib/rtc';
  import messageObject from '$lib/objects/messageObject';
  import offerObject from '$lib/objects/stringDataObject';
  import { fragment } from '$lib/utils/fileHandler';

  export let ws: WS;

  const logListStore = new LogListStore(logStore);

  $: filteredPeers = [] as Peer[];
  const unsub = peersStore.subscribe((peers) => {
    filteredPeers = peers.filter((peer) => peer.id !== $idStore);
  });
  onDestroy(() => {
    unsub();
  });

  const sendFile = async (fileUploadDOM: HTMLInputElement, rtc: RTC) => {
    const blobs = fileUploadDOM.files;
    // I have to fragment data larger than about 250KB due to the max message size
    for (let i = 0; i < blobs.length; i++) {
      const file = blobs[i];
      console.log(file);
      if (file.size > 300000000) {
        logListStore.pushWithCurrentTimeStamp(`Unable to transfer: ${file.name} exceeds 300MB`);
      }
      const fragemented: FragmentSet = await fragment(file, `${$idStore}-${i}`);
      rtc.send(JSON.stringify(fragemented.fileObject));
      fragemented.fragments.map((ab: ArrayBuffer) => {
        rtc.send(ab);
      });
      logListStore.pushWithCurrentTimeStamp(`Data sent fragmented into ${fragemented.fragments.length} chunks`);
    }
  };

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
      logListStore.pushWithCurrentTimeStamp(`Using an existing connection with ${id}`);
    }
    const fileUploadDOM = document.getElementById('fileUpload');
    fileUploadDOM.click();
    fileUploadDOM.onchange = async () => {
      await sendFile(fileUploadDOM as HTMLInputElement, rtc);
    };
  };
</script>

<div class="left-peers">
  <input type="file" id="fileUpload" style="display:none" multiple />
  {#if filteredPeers.length > 0}
    {#each filteredPeers as peer}
      <div
        class="peer"
        role="button"
        on:click={() => {
          peerOnClick(peer.id);
        }}
      >
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
    min-height: 100px;
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
