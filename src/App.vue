<template>
  <div>
    <SynthControls />
  </div>
</template>

<script>
import SynthControls from './components/SynthControls.vue'

export default {
  name: 'App',
  components: {
    SynthControls
  }
}
</script>

<style>
#app {
  color: #2c3e50;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  margin-top: 60px;
}
</style>
