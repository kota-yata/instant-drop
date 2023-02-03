<script lang="ts">
  import { fileStore, LogListStore, logStore } from '$lib/store';
  import { fileSave } from 'browser-fs-access';
  import { onMount } from 'svelte';

  const logListStore = new LogListStore(logStore);

  const IMAGE_TYPE = ['image/jpeg', 'image/png', 'image/webp'];
  let M_URL;
  onMount(() => {
    M_URL = window.URL || window.webkitURL;
  });

  let data: { index: number; name: string; url: string; isImage: boolean }[] = [];
  let dataLengthInThisSession = 0;

  fileStore.subscribe((files: File[]) => {
    for (let i = dataLengthInThisSession; i < files.length; i++) {
      const url = M_URL.createObjectURL(files[i]);
      const isImage = IMAGE_TYPE.indexOf(files[i].type) !== -1;
      data = [
        {
          index: i,
          name: files[i].name,
          url,
          isImage
        },
        ...data
      ]; // To trigger svelte reactivity
    }
    dataLengthInThisSession = files.length;
  });

  const dataOnClick = async (index: number): Promise<void> => {
    const file: File = $fileStore[index];
    fileSave(file, {
      fileName: file.name
    }).catch((err) => {
      logListStore.pushWithCurrentTimeStamp(`Failed to download ${file.name}`);
      console.log(err);
    });
  };
</script>

<div class="left-data container">
  <h2>Data Received</h2>
  <div class="left-data-container">
    {#if data.length > 0}
      {#each data as d}
        <div class="data">
          <h3>{d.name}</h3>
          <div class="data-buttons">
            <button
              class="data-buttons-button"
              on:click={() => {
                dataOnClick(d.index);
              }}
            >
              <img alt="download icon" src="/download.svg" />
            </button>
            <button class="data-buttons-button">
              <img alt="s3 icon" src="/s3.svg" />
            </button>
          </div>
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
        padding: 20px;
        width: calc(50% - 60px);
        max-width: 250px;
        height: calc(100% - 60px);
        border-radius: 10px;
        background: $bg-gray-secondary;
        margin: 10px 10px;
        & > h3 {
          height: 35px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        &-buttons {
          display: flex;
          padding-bottom: 10px;
          justify-content: space-evenly;
          &-button {
            background: $letter-gray;
            text-align: center;
            align-items: center;
            padding: 5px 10px;
            border-radius: 5px;
          }
        }
        &-preview {
          height: calc(100% - 74px);
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
