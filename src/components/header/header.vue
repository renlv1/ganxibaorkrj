<template>
  <div class="header">
    <div class="header-container">
      <div class="header-left">
        <div class="back" @click="back"></div>
        <div class="info-left" :class="[hasTopFix ? 'addAnimation' : 'removeAnimation']">
          <img class="avatar" :src="articleObj.avatar" />
          <div class="info-content">
            <p class="name">{{articleObj.name}}</p>
            <p class="date">{{$changeDate(articleObj.date,'-', 8)}} {{$changeDate(articleObj.date,':', 6)}}</p>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="info-right" :class="[hasTopFix ? 'addAnimation' : 'removeAnimation']" @click="attention">
          <div class="btn" :class="[$store.state.buttonStatus ? 'active' : 'unActive']">{{$store.state.buttonStatus ?
            '已关注' : '关注'}}
          </div>
        </div>
        <div class="share" @click="share"></div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import {mapGetters} from 'vuex'
export default {
  name: "VHeader",
  props: {
    hasTopFix: Boolean,
    articleObj: {},
  },
  /*computed: {
    ...mapGetters([
      'detailObj'
    ])
  },*/
  mounted() {
  },
  methods: {
    back() {
      if (parseInt(this.$store.state.device) === 0) {
        window.android.back()
      } else {
        window.webkit.messageHandlers.back.postMessage(null)
      }
    },
    share() {
      let obj = JSON.stringify(this.articleObj)
      if (parseInt(this.$store.state.device) === 0) {
        window.android.share(obj)
      } else {
        window.webkit.messageHandlers.share.postMessage(obj)
      }
    },
    attention() { // 取消关注自媒体
      console.log(this.articleObj)
      let name = this.articleObj.mediaUserName
      this.$https.post(`news/attentionMedia?mediaUserName=${name}`).then((res) => {
        if (res.data.success) {
          this.$store.state.buttonStatus = !this.$store.state.buttonStatus
          this.$store.commit('SET_BUTTON_STATUS', this.$store.state.buttonStatus)
          this.$toastD(this.$store.state.buttonStatus ? '已取消关注' : '已关注')
        } else if (res.data.resultCode === 'NOT_LOGGEDIN') {
          if (parseInt(this.$store.state.device) === 0) {
            window.android.toLogin()
          } else {
            window.webkit.messageHandlers.toLogin.postMessage(null)
          }
        } else {
          this.$toastD(res.data.msg)
        }
      })
    },
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "../../common/stylus/mixin.styl"
  .header
    background-color #fff
    position fixed
    width 100%
    z-index 999
    .header-container
      padding 15px
      height 50px
      display flex
      justify-content space-between
      align-items center
      border-1px(#ccc)
      .header-left
        display flex
        flex-direction row
        align-items center
        .back
          bg-image('images/back')
          width 25px
          height 25px
          background-size 25px 25px
        .info-left
          position relative
          opacity 0
          animation-duration 1s
          display flex
          flex-direction row
          &.addAnimation
            position absolute
            opacity 1
            left 45px
            -moz-animation-name: slideLeftIn;
            -webkit-animation-name: slideLeftIn;
            animation-name: slideLeftIn;
          &.removeAnimation
            position absolute
            opacity 1
            left -120px
            -moz-animation-name: slideLeftOut;
            -webkit-animation-name: slideLeftOut;
            animation-name: slideLeftOut;
          .avatar
            width 34px
            height 34px
            border-radius 100%
            margin-right 10px
          .info-content
            display flex
            flex-direction column
            justify-content flex-end
            font-size 12px
            .name
              color #000
              margin-bottom 5px
            .date
              color #999
      .header-right
        display flex
        flex-direction row
        align-items center
        .info-right
          animation-duration 1s
          &.addAnimation
            position absolute
            right 50px
            -moz-animation-name: slideRightIn;
            -webkit-animation-name: slideRightIn;
            animation-name: slideRightIn;
          &.removeAnimation
            position absolute
            right -120px
            -moz-animation-name: slideRightOut;
            -webkit-animation-name: slideRightOut;
            animation-name: slideRightOut;
          .btn
            font-size 12px
            min-width 60px
            height 33px
            text-align center
            line-height 33px
            border-radius 25px
            letter-spacing 1.5px
            &.unActive
              background-color #ff5e6b
              color #fff
            &.active
              background-color #fff
              color #999
              border 1px solid #ccc
        .share
          bg-image('images/share')
          width 25px
          height 25px
          background-size 25px 25px
</style>
