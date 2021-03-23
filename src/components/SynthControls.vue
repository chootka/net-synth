<template>
  <div>
    UI for synthesizer and OSC control
  </div>
</template>

<script>
export default {
  name: 'SynthControls',
  mounted () {
    browser.runtime.sendMessage({})
  },
  computed: {
    defaultText () {
      return browser.i18n.getMessage('extName')
    }
  }
}
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
