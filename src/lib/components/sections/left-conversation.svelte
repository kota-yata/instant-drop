<script lang="ts">
  import { idStore, peersStore, ChatListStore, chatStore, LogListStore, logStore } from '$lib/store';
  import type { Peer, ChatMessage, FragmentSet } from '$lib/types';
  import type { WS } from '$lib/ws';
  import { RTC } from '$lib/rtc';
  import MyMessageObject from '$lib/objects/messageObject';
  import MyStringDataObject from '$lib/objects/stringDataObject';
  import { DataType } from '$lib/proto/ws';
  import { fragment } from '$lib/utils/fileHandler';
  import { fileSave } from 'browser-fs-access';
  import { onMount } from 'svelte';

  export let ws: WS;

  let filteredPeers: Peer[] = [];
  let selectedPeerId: string = '';
  let messageText: string = '';

  const chatListStore = new ChatListStore(chatStore);
  const logListStore = new LogListStore(logStore);
  let M_URL: typeof URL;
  onMount(() => {
    // @ts-ignore - webkitURL exists in some browsers
    M_URL = window.URL || window.webkitURL;
  });

  peersStore.subscribe((peers) => {
    const currentId = $idStore;
    filteredPeers = peers.filter((peer) => peer.id !== currentId);
    if (!selectedPeerId && filteredPeers.length > 0) {
      selectedPeerId = filteredPeers[0].id;
    } else if (filteredPeers.findIndex((p) => p.id === selectedPeerId) === -1) {
      selectedPeerId = filteredPeers.length > 0 ? filteredPeers[0].id : '';
    }
  });

  const ensureRTC = async (peerId: string): Promise<RTC> => {
    let r = ws.rtcInstanceList.find((r) => r.id === peerId);
    if (!r) {
      const rtc = new RTC(ws, peerId);
      ws.rtcInstanceList.push({ id: peerId, rtc });
      const sdp = await rtc.createOffer();
      const offerObj = new MyStringDataObject($idStore, peerId, JSON.stringify(sdp));
      const messageObj = new MyMessageObject(DataType.Offer, offerObj);
      ws.sendMessage(messageObj);
      return rtc;
    }
    return r.rtc;
  };

  const selectPeer = async (peerId: string) => {
    selectedPeerId = peerId;
    await ensureRTC(peerId); // trigger ICE negotiation like before
  };

  const sendText = async () => {
    const target = selectedPeerId;
    const text = messageText.trim();
    if (!target || text.length === 0) return;
    const rtc = await ensureRTC(target);
    const payload = { kind: 'chat', from: $idStore, to: target, text };
    chatListStore.pushWithCurrentTimeStamp({ fromId: $idStore, toId: target, text });
    rtc.send(JSON.stringify(payload));
    messageText = '';
  };

  const sendFile = async (fileUploadDOM: HTMLInputElement) => {
    if (!selectedPeerId) return;
    const rtc = await ensureRTC(selectedPeerId);
    const blobs = fileUploadDOM.files;
    for (let i = 0; i < blobs.length; i++) {
      const file = blobs[i];
      if (file.size > 300000000) {
        logListStore.pushWithCurrentTimeStamp(`Unable to transfer: ${file.name} exceeds 300MB`);
        continue;
      }
      const fragemented: FragmentSet = await fragment(file, `${$idStore}-${i}`);
      rtc.send(JSON.stringify(fragemented.fileObject));
      fragemented.fragments.map((ab: ArrayBuffer) => {
        rtc.send(ab);
      });
      logListStore.pushWithCurrentTimeStamp(`Data sent fragmented into ${fragemented.fragments.length} chunks`);
      // Show on sender side timeline as well
      chatListStore.pushWithCurrentTimeStamp({ fromId: $idStore, toId: selectedPeerId, file });
    }
    // reset to allow re-selecting the same file
    fileUploadDOM.value = '';
  };

  const handleUploadChange = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    if (input) void sendFile(input);
  };

  let currentChat = [] as ChatMessage[];
  $: currentChat = $chatStore.filter(
    (m) => m.fromId === selectedPeerId || m.toId === selectedPeerId
  );
</script>

<div class="left-conversation">
  <div class="peers">
    {#if filteredPeers.length > 0}
      {#each filteredPeers as peer}
        <button
          class={peer.id === selectedPeerId ? 'peer selected' : 'peer'}
          title={peer.id}
          on:click={() => selectPeer(peer.id)}
        >
          <span class="icon" aria-hidden="true">{peer.icon}</span>
        </button>
      {/each}
    {:else}
      <h2>Searching peers nearby...</h2>
    {/if}
  </div>

  <div class="conversation container" aria-live="polite">
    {#if selectedPeerId}
      <h2>Chat with {selectedPeerId}</h2>
      <div class="messages">
        {#if currentChat.length > 0}
          {#each currentChat as m}
            <div class={m.fromId === $idStore ? 'msg out' : 'msg in'}>
              <div class="meta">{m.timeStamp} • {m.fromId === $idStore ? 'You' : m.fromId}</div>
              {#if m.file}
                <div class="file">
                  <div class="name">{m.file.name}</div>
                  <div class="preview">
                    {#if m.file.type && (m.file.type === 'image/jpeg' || m.file.type === 'image/png' || m.file.type === 'image/webp')}
                      <img alt={m.file.name} src={M_URL && m.file ? M_URL.createObjectURL(m.file) : ''} />
                    {:else}
                      <div class="no-preview">No Preview</div>
                    {/if}
                    <button
                      class="icon-button overlay"
                      aria-label="Download file"
                      title="Download"
                      on:click={() => fileSave(m.file, { fileName: m.file.name })}
                    >
                      <span class="icon" aria-hidden="true"></span>
                    </button>
                  </div>
                </div>
              {:else}
                <div class="text">{m.text}</div>
              {/if}
            </div>
          {/each}
        {:else}
          <p class="placeholder">No messages yet.</p>
        {/if}
      </div>
      <div class="composer">
        <input
          type="text"
          placeholder={`Message to ${selectedPeerId}`}
          bind:value={messageText}
          on:keydown={(e) => { if (e.key === 'Enter') sendText(); }}
        />
        <button on:click={sendText} disabled={messageText.trim().length === 0}>Send</button>
        <input type="file" id="upload" style="display:none" multiple on:change={handleUploadChange} />
        <button on:click={() => document.getElementById('upload').click()}>Send File</button>
      </div>
    {:else}
      <div class="empty">
        <p>Select a peer to start chatting.</p>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @import '../../../styles/variable.scss';

  .left-conversation {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
  }
  .peers {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: center;
    min-height: 72px;
    .peer {
      cursor: pointer;
      width: 56px;
      height: 56px;
      font-size: 32px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: $bg-gray-secondary;
      &.selected { outline: 2px solid $letter-gray; }
    }
  }
  .conversation {
    display: flex;
    flex-direction: column;
    height: 100%;
    .messages {
      margin-top: 8px;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
      .msg {
        margin: 10px 0;
        padding: 8px;
        border-radius: 8px;
        max-width: 90%;
        &.in { background: $bg-gray-secondary; }
        &.out { background: $bg-gray-tertiary;margin-left: auto; }
        .meta { font-size: 12px; opacity: 0.7; margin-bottom: 4px; }
        .text { white-space: pre-wrap; word-break: break-word; }
        .file {
          .name { font-weight: 600; margin-bottom: 6px; word-wrap: break-word; }
          .preview { position: relative; display: inline-block; }
          img { max-width: 100%; max-height: 180px; display: block; border-radius: 6px; }
          .no-preview { opacity: 0.8; padding: 40px 80px; background: $bg-white; border-radius: 6px; }
          .icon-button.overlay {
            position: absolute;
            right: 8px;
            bottom: 8px;
            background: $letter-gray;
            border-radius: 8px;
            padding: 6px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: 0.2s;
          }
          .icon-button.overlay:hover { opacity: 0.9; }
          .icon-button.overlay .icon {
            width: 18px;
            height: 18px;
            display: block;
            background-color: $bg-white;
            -webkit-mask: url('/download.svg') no-repeat center / contain;
            mask: url('/download.svg') no-repeat center / contain;
          }
        }
      }
      .placeholder { opacity: 0.7; text-align: center; }
    }
    .composer {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      & > input[type="text"] {
        flex: 1;
        padding: 6px 8px;
        border-radius: 6px;
        background: $bg-gray-secondary;
      }
      & > button {
        padding: 6px 10px;
        border-radius: 6px;
        background: $bg-gray-secondary;
      }
    }
    .empty { text-align: center; opacity: 0.8; }
  }
</style>
