<template>
  <div id="app">
    {{message}}
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: "App",
  components: {
  },
  setup() {
    const message = ref<string>('hello');

    return {
      message,
    };
  }
});
</script>