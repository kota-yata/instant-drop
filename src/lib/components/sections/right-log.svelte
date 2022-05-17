<script lang="ts">
  import { logStore } from '$lib/store';
</script>

<div class="right-log container">
  <h2>Connection Log</h2>
  <div class="right-log-container">
    {#each $logStore as log}
      <div>
        <div class="right-log-container-timeStamp">{log.timeStamp}</div>
        <div class="right-log-container-log">{log.log}</div>
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  @import '../../../styles/variable.scss';

  .right-log {
    height: calc(65% - #{$container-mp * 6});
    overflow-y: hidden;
    &-container {
      font-size: 15px;
      height: calc(100% - 45px);
      overflow-y: auto;
      & > div {
        line-height: 20px;
        display: flex;
      }
      &-timeStamp {
        font-weight: 700;
        width: 80px;
      }
    }
  }
</style>
