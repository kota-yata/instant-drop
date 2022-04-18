<script lang="ts">
  export let iconString = '';
</script>

<div class="icon">{iconString}</div>

<style lang="scss">
  @import '../../styles/variable.scss';

  .icon {
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: $bg-gray-secondary;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
</style>
