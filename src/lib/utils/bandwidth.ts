export const modifyBandwidth = (offer: RTCSessionDescriptionInit): RTCSessionDescriptionInit => {
  const sdp = offer.sdp;
  console.log(sdp);
  const isB = sdp.search('b='); // b=
  const isNa = sdp.search('max-message-size:'); // na=... or a=
  if (!isB && !isNa) return offer;
  return offer;
};
