<script>
import Icon from "../icon.svelte";
</script>
<div class="right-info container">
  <h2>Your Info</h2>
  <div class="right-info-icid">
    <!--Icon and id will show up here-->
    <Icon iconString="😀" />
    <h2>DS45</h2>
  </div>
  <div class="right-info-meta">
    <p>IP Address : 127.0.0.1</p>
    <p>User Agent : Chromium</p>
    <p>Sent : 10MB</p>
    <p>Received : 159MB</p>
  </div>
</div>

<style lang="scss">
  @import '../../../styles/variable.scss';

  .right-info {
    height: calc(35% - #{$container-mp * 6});
    overflow-y: auto;
    &-icid {
      display: flex;
      align-items: center;
      height: 70px;
      font-size: 30px;
      margin-bottom: 15px;
      & > h2 {
        margin-left: 15px;
      }
    }
  }
</style>
