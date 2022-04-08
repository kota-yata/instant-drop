<script context="module" lang="ts">
  export const prerender = true;
  export const hydrate = false;
</script>

<script lang="ts">
</script>

<svelte:head>
  <title>Home | Instant Drop</title>
</svelte:head>

<div class="left">
  <div class="left-header">
    <h1>Instant Drop</h1>
  </div>
  <div class="left-peers">
    <!--Peers will show up here-->
  </div>
  <div class="left-data">
    <h2>Data Received</h2>
    <p>Click data to download</p>
    <div class="left-data-container">
      <!--Received data will show up here-->
    </div>
  </div>
</div>
<div class="right">
  <div class="right-log">
    <h2>Connection Log</h2>
    <div class="right-log-container">
      <!--Connection log will show up here-->
    </div>
  </div>
  <div class="right-info">
    <h2>Your Info</h2>
    <div class="right-info-icid">
      <!--Icon and id will show up here-->
    </div>
    <div class="right-info-meta">
      <p>IP Address : 127.0.0.1</p>
      <p>User Agent : Chromium</p>
      <p>Sent : 10MB</p>
      <p>Received : 159MB</p>
    </div>
  </div>
</div>
