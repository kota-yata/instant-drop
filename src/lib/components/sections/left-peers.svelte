<script lang="ts">
  import type { RTC } from '$lib/rtc';
  import { idStore, peersStore } from '$lib/store';
  import Icon from '../icon.svelte';

  export let rtc: RTC;

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
  {#if $peersStore.length > 0}
    {#each $peersStore as peer}
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
