<script lang="ts">
  import Icon from '../icon.svelte';

  export let peers = [
    { icon: '🔨', id: 'BF30' },
    { icon: '💪', id: 'BF30' },
    { icon: '🏘', id: 'BF30' },
    { icon: '🔨', id: 'BF30' }
  ];
</script>

<div class="left-peers">
  {#if peers.length > 0}
    {#each peers as peer}
      <div class="peer" role="button">
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
