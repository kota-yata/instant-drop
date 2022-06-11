<script>

import { idStore } from "$lib/store";

</script>
<div class="left-header">
  <h1>Instant Drop (id: {$idStore})</h1>
</div>

<style lang="scss">
  @import '../../../styles/variable.scss';

  .left-header {
    height: calc(5% - #{$container-mp});
  }
</style>
