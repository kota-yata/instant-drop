<script lang="ts">
  import type { RTC } from '$lib/rtc';
  import { idStore, peersStore } from '$lib/store';
  import type { peer } from '$lib/types';
  import Icon from '../icon.svelte';

  export let rtc: RTC;

  $: filteredPeers = [] as peer[];
  peersStore.subscribe((peers) => {
    filteredPeers = peers.filter((peer) => peer.id !== $idStore);
  })

  const peerOnClick = async (id: string) => {
    const sdp = await rtc.createOffer();
    const offerObj = {
      from: $idStore,
      to: id,
      offer: JSON.stringify(sdp)
    };
    rtc.send(JSON.stringify(offerObj));
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
