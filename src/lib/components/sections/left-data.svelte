<script lang="ts">
  import { fileStore } from '$lib/store';
  import { onMount } from 'svelte';

  const IMAGE_TYPE = ['image/jpeg', 'image/png', 'image/webp'];
  let M_URL;
  onMount(() => {
    M_URL = window.URL || window.webkitURL;
  });

  let data: { name: string, url: string, isImage: boolean }[] = [];
  let dataLengthInThisSession = 0;

  fileStore.subscribe((files: File[]) => {
    for (let i = dataLengthInThisSession; i < files.length; i++) {
      const url = M_URL.createObjectURL(files[i]);
      const isImage = IMAGE_TYPE.indexOf(files[i].type) !== -1;
      data = [{
        name: files[i].name,
        url,
        isImage
      }, ...data]; // To trigger svelte reactivity
    }
    dataLengthInThisSession = files.length;
  });
</script>

<div class="left-data container">
  <h2>Data Received</h2>
  <div class="left-data-container">
    {#if data.length > 0}
      {#each data as d}
        <div class="data" role="button">
          <h3>{d.name}</h3>
          <div class="data-preview">
            {#if d.isImage}
            <img alt={d.name} src={d.url} />
            {:else}
            <p>No Preview</p>
            {/if}
          </div>
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
      justify-content: center;
      flex-wrap: wrap;
      overflow-y: auto;
      .data {
        cursor: pointer;
        padding: 20px;
        width: calc(50% - 60px);
        max-width: 250px;
        height: calc(250px - 40px);
        border-radius: 10px;
        background: $bg-gray-secondary;
        margin: 10px 10px;
        & > h3 {
          height: 40px;
        }
        &-preview {
          height: calc(100% - 40px);
          display: flex;
          justify-content: center;
          align-items: center;
          & > img {
            max-height: 100%;
            max-width: 100%;
          }
        }
      }
      & > h2 {
        width: 100%;
        text-align: center;
      }
    }
  }
</style>
