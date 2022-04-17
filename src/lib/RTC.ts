export class RTC {
  private CONFIG: RTCConfiguration = { 'iceServers': [{ 'urls': 'stun:stun.1.google.com:19302' }] };
  private peerConnection: RTCPeerConnection;
  private sendChannel: RTCDataChannel;
  private receiveChannel: RTCDataChannel;
  // Signaling
  constructor(remoteId: string) {
    console.log('signaling');
  }
  public async startConnection(channel: string): Promise<void> {
    // Set up the local peer
    this.peerConnection = new RTCPeerConnection(this.CONFIG);
    this.sendChannel = this.peerConnection.createDataChannel(channel);
    this.sendChannel.onopen = this.sendChannel.onclose = this.handleSendChannelStatusChange;
    // Set up the remote peer
    // this.remoteConnection.ondatachannel = this.receiveChannelCallback;
    // Set up the ICE candidates
    // this.localConnection.onicecandidate = event => !event.candidate || this.remoteConnection.addIceCandidate(event.candidate).catch((reason) => {
    //   throw Error(reason);
    // });
    const offer = await this.peerConnection.createOffer({
      iceRestart: false,
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    });
    await this.localConnection.setLocalDescription(offer);
    // In a real application, this would require a signaling server to exchange the description object.
    await this.remoteConnection.setRemoteDescription(this.localConnection.localDescription);
    const answer = await this.remoteConnection.createAnswer();
    this.remoteConnection.setLocalDescription(answer);
    await this.localConnection.setRemoteDescription(this.remoteConnection.localDescription).catch((reason) => {
      throw Error(reason);
    });
  }
  public sendMessage(message: string): void {
    this.sendChannel.send(message);
    console.log('Message sent');
  }
  public disconnect(): void {
    this.sendChannel.close();
    this.receiveChannel.close();
    this.localConnection.close();
    this.remoteConnection.close();
    this.sendChannel = this.receiveChannel = this.localConnection = this.remoteConnection = null;
  }
  private handleSendChannelStatusChange(event: RTCDataChannelEvent) {
    if (!this.sendChannel) return;
    if (this.sendChannel.readyState === 'open') {
      console.log('Data Channel Open : ', event);
    } else {
      console.log('Data Channel Closed : ', event);
    }
  }
  private handleReceiveChannelStatusChange(event: RTCDataChannelEvent) {
    if (!this.receiveChannel) return;
    console.log(`Receive channel's status has changed to `, this.receiveChannel.readyState);
    console.log('Event', event);
  }
  private handleReceiveData(event: MessageEvent) {
    console.log('Following message received : ', event.data);
  }
  private receiveChannelCallback(event: RTCDataChannelEvent) {
    this.receiveChannel = event.channel;
    this.receiveChannel.onmessage = this.handleReceiveData;
    this.receiveChannel.onopen = this.handleReceiveChannelStatusChange;
    this.receiveChannel.onclose = this.handleReceiveChannelStatusChange;
  };
};
