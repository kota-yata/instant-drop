<script lang="ts">
  export let logContainer = ['2022/04/07 21:41:22 Connection Established', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received',
    '2022/04/07 21:41:22 Message sent', '2022/04/07 21:41:22 Connection Interrupted', '2022/04/07 21:41:22 Connection Established', '2022/04/07 21:41:22 Message received',
    '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message sent', '2022/04/07 21:41:22 Connection Established',
    '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message sent', '2022/04/07 21:41:22 Connection Interrupted',
    '2022/04/07 21:41:22 Connection Established', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message sent',
    '2022/04/07 21:41:22 Connection Established', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received',
    '2022/04/07 21:41:22 Message sent', '2022/04/07 21:41:22 Connection Interrupted', '2022/04/07 21:41:22 Connection Established', '2022/04/07 21:41:22 Message received',
    '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message sent', '2022/04/07 21:41:22 Connection Established',
    '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message sent', '2022/04/07 21:41:22 Connection Interrupted',
    '2022/04/07 21:41:22 Connection Established', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message received', '2022/04/07 21:41:22 Message sent'
  ];
</script>

<div class="right-log container">
  <h2>Connection Log</h2>
  <div class="right-log-container">
    {#each logContainer as log}
    <p>{log}</p>
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
    }
  }
</style>
