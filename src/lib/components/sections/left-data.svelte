<script lang="ts">
  export let data = [
    { name: '2020StudentData.csv', from: 'BF30', lastModified: '2022-04-07', type: 'csv' },
    { name: '2020StudentData.csv', from: 'BF30', lastModified: '2022-04-07', type: 'csv' },
    { name: '2020StudentData.csv', from: 'BF30', lastModified: '2022-04-07', type: 'csv' },
    { name: '2020StudentData.csv', from: 'BF30', lastModified: '2022-04-07', type: 'csv' },
  ];
</script>

<div class="left-data container">
  <h2>Data Received</h2>
  <div class="left-data-container">
    {#if data.length > 0}
      {#each data as d}
      <div class="data" role="button">
        <h2>{d.name}</h2>
        <p>From : {d.from}</p>
        <p>Last Modified : {d.lastModified}</p>
        <p>Type : {d.type}</p>
      </div>
      {/each}
    {:else}
    <h2>You haven't received any data yet</h2>
    {/if}
  </div>
</div>

<style lang="scss">
  @import '../../../styles/variable.scss';

  .left-data {
    height: calc(40% - #{$container-mp});
    overflow: hidden;
    &-container {
      width: 100%;
      height: calc(100% - 45px);
      display: flex;
      align-items: stretch;
      overflow-x: auto;
      .data {
        cursor: pointer;
        padding: 30px;
        border-radius: 10px;
        background: $bg-gray-secondary;
        margin: 0 10px;
        & > h2 {
          margin-bottom: 20px;
        }
        & > p {
          font-size: 15px;
        }
      }
      & > h2 {
        width: 100%;
        text-align: center;
      }
    }
  }
</style>
