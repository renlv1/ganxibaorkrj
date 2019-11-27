<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'app',
  mounted() {
    var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    if (isAndroid) {
      this.$store.commit('SET_DEVICE', 0)
    } else {
      this.$store.commit('SET_DEVICE', 1)
    }
    if (isiOS) {
      this.$store.commit('SET_DEVICE', 1)
    } else {
      this.$store.commit('SET_DEVICE', 0)
    }
  }
}
</script>

<style>
  @import "common/reset.css";
  @import "common/animation.css";
</style>
