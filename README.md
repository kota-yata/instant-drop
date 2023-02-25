# Instant Drop
P2P File transfer application on WebRTC

### Signaling
Signaling process is done via protobuf communication on WebSocket connection. [A signaling server for Instant Drop](https://github.com/kota-yata/instant-drop-server) is written in Java

### Communication with peers
After WebRTC connection is established, files are transferred through [WebRTC Data Channel](https://webrtc.org/getting-started/data-channels). This app fragments the file into 16KB chunks as the maximum message size of WebRTC Data Channel is quite limited.
