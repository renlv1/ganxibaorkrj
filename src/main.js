/* eslint-disable */

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Cube from 'cube-ui'
import axios from 'axios'

Vue.config.productionTip = false

Vue.use(Cube)
axios.defaults.baseURL = 'http://stemcel-web.5544444455.com/'
axios.defaults.withCredentials = true
Vue.prototype.$https = axios
Vue.prototype.$toastD = function (text) {
  this.toast = this.$createToast({
    txt: text,
    time: 2000,
    type: 'txt'
  })
  this.toast.show()
}

// 时间戳转换
Vue.prototype.$changeDate = function (time, str = '/', type = 1) {
  function ifTime(value) { // 判断时间是否是个位数
    if (value < 10) {
      return '0' + value
    }
    return value
  }

  if (time) {
    let newTime = new Date(time)
    let day = newTime.getDate()
    let month = newTime.getMonth() + 1
    let year = newTime.getFullYear()
    let hours = newTime.getHours()
    let min = newTime.getMinutes()
    let sec = newTime.getSeconds()
    switch (type) {
      case 1:
        return year + str + ifTime(month) + str + ifTime(day) + ' ' + ifTime(hours) + ':' + ifTime(min)
      case 2:
        return year + str + ifTime(month) + str + ifTime(day) + ' 00:00:00'
      case 3:
        return year + str + ifTime(month) + str + ifTime(day) + ' 23:59:59'
      case 4:
        return year + str + ifTime(month) + str + ifTime(day)
      case 5:
        return year + str + ifTime(month) + str + ifTime(day)
      case 6:
        return ifTime(hours) + ':' + ifTime(min)
      case 7:
        return ifTime(hours) + ':' + ifTime(min) + ':' + ifTime(sec)
      case 8:
        return ifTime(month) + '-' + ifTime(day)
    }
  }
}

new Vue({
  render: h => h(App),
  router,
  store,
}).$mount('#app')
