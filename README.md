# Instant Drop
File transfer application on WebRTC

### Signaling
WebSocket connection. [The signaling server](https://github.com/kota-yata/instant-drop-server) is written in Java

### Communication with peers
After WebRTC connection is established, files are transferred through [WebRTC Data Channel](https://webrtc.org/getting-started/data-channels). This app fragments the file into 16KB chunks as the maximum message size of WebRTC Data Channel is quite limited.
