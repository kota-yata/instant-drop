<script lang="ts">
  import { idStore } from '$lib/store';
  import { UserAgent } from '$lib/utils/userAgent';
  import { onMount } from 'svelte';

  import Icon from '../icon.svelte';

  let os = 'Unknown';
  let browser = 'Unknown';
  let lang = 'Unknown';
  onMount(() => {
    os = UserAgent.getOS();
    browser = UserAgent.getBrowser();
    lang = window.navigator.language;
  });
</script>

<div class="right-info container">
  <h2>Your Info</h2>
  <div class="right-info-icid">
    <!--Icon and id will show up here-->
    <Icon iconString="😀" />
    <h2>{$idStore}</h2>
  </div>
  <div class="right-info-meta">
    <p>OS : {os}</p>
    <p>Browser : {browser}</p>
    <p>Language : {lang}</p>
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
