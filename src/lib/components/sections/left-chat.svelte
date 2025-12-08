<script lang="ts">
  import { idStore, peersStore, ChatListStore, chatStore } from '$lib/store';
  import type { Peer, ChatMessage } from '$lib/types';
  import type { WS } from '$lib/ws';
  import { RTC } from '$lib/rtc';
  import MyMessageObject from '$lib/objects/messageObject';
  import MyStringDataObject from '$lib/objects/stringDataObject';
  import { DataType } from '$lib/proto/ws';

  export let ws: WS;

  let filteredPeers: Peer[] = [];
  let selectedPeerId: string = '';
  let messageText: string = '';

  const chatListStore = new ChatListStore(chatStore);

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

  let currentChat = [] as ChatMessage[];
  $: currentChat = $chatStore.filter(
    (m) => m.fromId === selectedPeerId || m.toId === selectedPeerId
  );
</script>

<div class="left-chat container">
  <h2>Chat</h2>
  <div class="left-chat-controls">
    <select bind:value={selectedPeerId} aria-label="Select peer">
      {#each filteredPeers as p}
        <option value={p.id}>{p.id}</option>
      {/each}
    </select>
    <input
      type="text"
      placeholder={selectedPeerId ? `Message to ${selectedPeerId}` : 'No peers available'}
      bind:value={messageText}
      on:keydown={(e) => {
        if (e.key === 'Enter') sendText();
      }}
      disabled={!selectedPeerId}
    />
    <button on:click={sendText} disabled={!selectedPeerId || messageText.trim().length === 0}>Send</button>
  </div>
  <div class="left-chat-messages">
    {#if currentChat.length > 0}
      {#each currentChat as m}
        <div class={m.fromId === $idStore ? 'msg out' : 'msg in'}>
          <div class="meta">{m.timeStamp} • {m.fromId === $idStore ? 'You' : m.fromId}</div>
          <div class="text">{m.text}</div>
        </div>
      {/each}
    {:else}
      <p class="placeholder">No messages yet.</p>
    {/if}
  </div>
  
</div>

<style lang="scss">
  @import '../../../styles/variable.scss';

  .left-chat {
    height: calc(10% - #{$container-mp});
    min-height: 100px;
    display: flex;
    flex-direction: column;
    &-controls {
      display: flex;
      gap: 10px;
      align-items: center;
      & > select, & > input, & > button {
        padding: 6px 8px;
        border-radius: 6px;
        background: $bg-gray-secondary;
      }
      & > input {
        flex: 1;
        background: $bg-gray-secondary;
      }
    }
    &-messages {
      margin-top: 8px;
      height: calc(100% - 42px);
      overflow-y: auto;
      .msg {
        margin: 4px 0;
        padding: 8px;
        border-radius: 8px;
        max-width: 90%;
        &.in { background: $bg-gray-secondary; }
        &.out { background: $letter-gray; margin-left: auto; }
        .meta { font-size: 12px; opacity: 0.7; margin-bottom: 4px; }
        .text { white-space: pre-wrap; word-break: break-word; }
      }
      .placeholder { opacity: 0.7; text-align: center; }
    }
  }
</style>
