<template>
  <div class="detail" :class="{'noScrollLoad': Number(fromType) === 2}" @click="eventClosePopup($event)">
    <div class="container">
      <v-header v-if="Number(fromType) === 1" :hasTopFix="isShowTop" :articleObj="articleObj" />
      <div class="scroll-list-wrap">
        <cube-scroll
          :scroll-events="['scroll']"
          class="scroll-wrapper"
          ref="scroll"
          :options="options"
          :data="commentList"
          @scroll="onScrollHandle"
          @pulling-up="onPullingDown">
          <div class="article" :class="{'no-padding': Number(fromType) === 2}">
            <h5 class="title">{{detailObj.title}}</h5>
            <div class="article-info" ref="info">
              <div class="info-left">
                <img class="avatar" :src="detailObj.mediaImgUrl" />
                <div class="info-content">
                  <p class="name">{{detailObj.mediaName}}</p>
                  <p class="date">{{$changeDate(detailObj.createAt,'-', 8)}} {{$changeDate(detailObj.createAt,':',
                    6)}}</p>
                </div>
              </div>
              <div class="info-right" @click="attention" v-if="Number(fromType) === 1">
                <div class="btn" :class="[$store.state.buttonStatus ? 'active' : 'unActive']">
                  {{$store.state.buttonStatus ? '已关注' : '关注'}}
                </div>
              </div>
            </div>
            <div class="article-content">
              <div class="text-content">
                {{detailObj.content}}
              </div>
              <ul>
                <li v-for="item in detailObj.imageUrlArray" :key="item.index">
                  <img @load="refresh" class="article-bg" :src="item" />
                </li>
              </ul>
            </div>
            <div class="article-tags">
              <span class="dot"></span>
              <ul>
                <li v-for="(item,index) in tagsList" :key="index">{{item}}</li>
              </ul>
            </div>
            <div class="article-comment">
              <div class="title">评论区（{{detailObj.commentCount > 999 ? '999+' : detailObj.commentCount}}）</div>
              <ul class="list-wrapper">
                <li v-for="(item,index) in commentList" :key="index">
                  <div class="left-li">
                    <!-- <img class="avatar" :src="item.avatar" />-->
                    <img class="avatar" :src="item.userImgUrl" />
                    <div class="user-info">
                      <p class="user-name">{{item.userName}}</p>
                      <p class="comment-content">{{item.commentContent}}</p>
                      <p class="other-info">{{$changeDate(item.createAt,'-',8)}} {{$changeDate(item.createAt,'-',6)}} •
                        <span @click="reply(item)"
                              :class="{'hasComment': item.subCommCount !== 0}">{{item.subCommCount === 0 ? '' : `${item.subCommCount}`}}回复</span>
                      </p>
                    </div>
                  </div>
                  <!--点赞-->
                  <div class="right-li" @click="giveGreat(item)">
                    <div class="zan" :class="[item.praiseFlag? 'like': 'noLike']"></div>
                    <div class="zan-num"
                         :class="[item.praiseFlag ? 'likeActive': 'noLikeActive']">
                      {{Number(item.praiseCount) > 999 ?
                      '999+' : item.praiseCount}}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </cube-scroll>
      </div>
      <div class="article-comment-input" :class="{'nav-hide': $store.state.inputOpen}" v-if="Number(fromType) === 1">
        <input class="ipt" ref="inpt" :class="{'active': sendShow}" v-model="msg" placeholder="说两句..." @blur="blurFn"
               @input="getFocus" @focus="getFocus" @keyup.enter.native="submitText" />
        <div class="list" v-show="focusShow">
          <div class="msg-box">
            <div class="msg-icon"></div>
            <div class="badge" v-if="detailObj.commentCount !== 0">{{detailObj.commentCount > 999 ? '999+' :
              detailObj.commentCount}}
            </div>
          </div>
          <div class="collection-icon" @click="collection"
               :class="[$store.state.collectionStatus ? 'collection' : 'noCollection']"></div>
          <div class="share-icon"></div>
        </div>
        <div class="send-but" v-show="sendShow" @click.stop="sendComment">
          <div class="icon" :class="{'active': iconShow}"></div>
        </div>
      </div>
      <div class="detail" v-if="Number(fromType) === 2">
        <div class="genesis-btn">
          <div class="btn" @click="findLocalDevice">打开Genesis,查看更多评论</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import VHeader from '../components/header/header'

export default {
  components: {
    VHeader
  },
  data() {
    return {
      focusShow: true,
      sendShow: false,
      iconShow: false,
      pageIndex: 1,
      pageSize: 15,
      hideClass: false,
      buttonStatus: this.$store.state.buttonStatus,
      id: 1, // 回复id
      detailsId: 0, // 客户端接口id
      detailObj: {},
      urlBgImg: '',
      isShowTop: false,
      imageUrl: '',
      articleObj: {},
      msg: '', // 评论发送的内容
      tagsList: [],
      commentList: [],
      badge: 0, // 徽章数量
      flag: 1,
      sessionId: '',
      timestamp: '',
      sign: '',
      obj: {},
      fromType: 1,
      responseTimes: 0,
    }
  },
  name: "detail",
  updated() {
  },
  created() {
    this.userData()
  },
  // destroyed() {
  //   window.removeEventListener('scroll', this.handleScroll, false)
  // },
  computed: {
    options() {
      return {
        pullUpLoad: {
          txt: {
            noMore: '暂无数据'
          },
          visible: true
        }
      }
    }
  },
  mounted() {
    let href = this.showWindowHref()
    let newsId = href['newsId']
    this.detailsId = newsId
    this.sessionId = href['sessionId']
    this.timestamp = href['timestamp']
    this.sign = href['sign']
    this.fromType = href['fromType']
    this.getCommentList()
  },
  methods: {
    refresh() {
      this.$refs.scroll.refresh()
    },
    noLogin() {
      if (parseInt(this.$store.state.device) === 0) {
        window.android.toLogin()
      } else {
        window.webkit.messageHandlers.toLogin.postMessage(null)
      }
    },
    eventClosePopup(e) {
      if (!this.$refs.inpt.contains(e.target)) {
        this.focusShow = true
        this.sendShow = false
      }
    },
    getFocus() {
      this.focusShow = false
      this.sendShow = true
      if (this.msg !== '') {
        this.iconShow = true
      } else {
        this.iconShow = false
      }
    },
    /*1.0 添加评论*/
    submitText() {
      // 评论发送请求
      this.$https.post(`comm/addcomm?newsId=${this.detailsId}commnetSourceId=${this.msg}`).then((res) => {
        if (res.data.success) {
          this.getCommentList()
        } else if (res.data.resultCode === 'NOT_LOGGEDIN') {
          this.noLogin()
        } else {
          this.$toastD(res.data.msg)
        }
      })
    },

    attention() { // 取消关注自媒体
      let name = this.detailObj.mediaUserName
      this.$https.post(`news/attentionMedia?mediaUserName=${name}`).then((res) => {
        if (res.data.success) {
          this.obj.buttonStatus = !this.obj.buttonStatus
          this.$store.commit('SET_BUTTON_STATUS', this.obj.buttonStatus)
          this.$toastD(this.$store.state.buttonStatus ? '已取消关注' : '已关注')
          this.getDetails(this.detailsId)
        } else if (res.data.resultCode === 'NOT_LOGGEDIN') {
          this.noLogin()
        } else {
          this.$toastD(res.data.msg)
        }
      })
    },
    // 收藏
    /*1.2 收藏/取消收藏资讯
    newsIds	（必填）资讯id 多个用 ，分割*/
    collection() { // 收藏
      let newsIds = this.detailsId
      this.$https.post(`news/collectionNews?newsIds=${newsIds}`).then((res) => {
        if (res.data.success) {
          if (this.$store.state.collectionStatus) {
            this.$store.commit('SET_COLLECTION_STATUS', false)
            this.$toastD('取消收藏')
          } else {
            this.$store.commit('SET_COLLECTION_STATUS', true)
            this.$toastD('已收藏')
          }
        } else if (res.data.resultCode === 'NOT_LOGGEDIN') {
          this.noLogin()
        } else {
          this.$toastD(res.data.msg)
        }
      })
    },
    blurFn() {
      /*this.focusShow = true
      this.sendShow = false*/
    },
    giveGreat(item) {   // 点赞
      this.$https.post(`comm/praisecomm?commId=${item.id}`).then((res) => {
        if (res.data.success) {
          if (item.praiseFlag && item.praiseCount > 0) {
            item.praiseCount--
            item.praiseFlag = 0
            this.$toastD('取消点赞')
          } else {
            item.praiseCount++
            item.praiseFlag = 1
            this.$toastD('已点赞')
          }
        } else if (res.data.resultCode === 'NOT_LOGGEDIN') {
          this.noLogin()
        } else {
          this.$toastD(res.data.msg)
        }
      })
    },
    // 发送评论
    sendComment() {
      this.focusShow = false
      this.sendShow = true
      if (this.flag === 1) {
        this.$https.post(`comm/addcomm?newsId=${this.detailsId}&commentContent=${this.msg}`).then((res) => {
          if (res.data.success) {
            this.msg = ''
            this.iconShow = false
            this.getCommentList()
          }
        })
      } else {
        this.noLogin()
      }
    },
    userData() {
      this.$https.post(`user/getnewsurl?newsId=${this.detailsId}`).then((res) => {
        if (res.data.success) {
          if (this.sessionId && this.timestamp && this.sign) { // 客户端已登录
            this.$https.post(`user/authlogin?sessionId=${this.sessionId}&timestamp=${this.timestamp}&sign=${this.sign}`).then((res) => { // auth登录
              if (res.data.success) {
                this.flag = 1
                this.$https.defaults.withCredentials = true
              } else {
                this.flag = 2
                this.$store.commit('SET_BUTTON_STATUS', false)
                this.$store.commit('SET_COLLECTION_STATUS', false)
                this.$https.defaults.withCredentials = false
              }
            })
          } else { //未登录，调客户端的方法
            this.flag = 2
            this.$store.commit('SET_BUTTON_STATUS', false)
            this.$store.commit('SET_COLLECTION_STATUS', false)
            this.$https.defaults.withCredentials = false
          }
          setTimeout(() => {
            this.getDetails(this.detailsId)
          }, 500)
        }
      })
    },
    share() {
      let obj = JSON.stringify(this.articleObj)
      if (parseInt(this.$store.state.device) === 0) {
        window.android.share(obj)
      } else {
        window.webkit.messageHandlers.share.postMessage(obj)
      }
    },
    showWindowHref() {
      // window.location.href
      var url = window.location.hash
      // var url = 'http://ganxibao.5544444455.com/#/detail?sessionId=87f0de1f6e6c29cb713c9097b28f9059&timestamp=1572504362196&sign=a28b3dbaa61e8c01b2ef01d100781f66&newsId=3&fromType=1&language=1'
      // var url = 'http://ganxibao.5544444455.com/#/detail?newsId=3&fromType=1&language=1'
      var arglists = url.split('?');
      if (arglists[0] === url) {
        return '';
      }
      var arr = arglists[1].split('&');
      var obj = {};
      for (let i = 0; i < arr.length; i++) {
        var arg = arr[i].split('=');
        obj[arg[0]] = arg[1];
      }
      return obj;
    },
    // 1.4 查询资讯详情
    getDetails(index) {
      this.$https.post(`news/getNewsDetailById?newsId=${index}`).then((res) => {
        if (res.data.success) {

          this.detailObj = res.data.data

          // 分享需要的字段
          this.articleObj.newsId = index
          this.articleObj.url = 'http://ganxibao.5544444455.com/#/detail'
          this.articleObj.avatar = this.detailObj.mediaImgUrl
          this.articleObj.name = this.detailObj.mediaName
          this.articleObj.title = this.detailObj.title
          this.articleObj.date = this.detailObj.createAt
          this.articleObj.articleContent = this.detailObj.content
          this.articleObj.mediaUserName = this.detailObj.mediaUserName
          if (this.detailObj) {
            this.articleObj.articlePic = this.detailObj.imageUrlArray[0]
          }

          this.imageUrl = this.detailObj.imageUrlArray[0] // 文章背景图

          let status  //1:已关注,2:未关注

          if (this.flag === 1) {
            this.detailObj.follow === 1 ? status = true : status = false
            this.$store.commit('SET_BUTTON_STATUS', status)
          } else {
            this.$store.commit('SET_BUTTON_STATUS', false)
          }

          let flags = this.detailObj.flags // 标签
          if (flags) {
            if (flags.indexOf(',') > -1) {
              this.tagsList = flags.split(',')
            } else {

              this.tagsList.push(flags)

            }
          }

          let collectionFlag //是否收藏 0 未收藏 1：已收藏


          if (this.flag === 1) {
            res.data.data.collectionFlag === 0 ? collectionFlag = false : collectionFlag = true
            this.$store.commit('SET_COLLECTION_STATUS', collectionFlag)
          } else {
            this.$store.commit('SET_COLLECTION_STATUS', false)
          }
        }
      })
    },
    /*1.3 根据评论id查询评论回复列表
接口URL: http://stemcel-web.5544444455.com/comm/getCommsBySourceCommId*/
    queryReply(index) {
      this.$https.get(`comm/getCommsBySourceCommId?sourceCommId=${index}`).then((res) => {
        if (res.status) {
        }
      })
    },
    // 1.2 根据资讯id查询评论列表
    getCommentList() {
      let index = this.detailsId
      this.$https.get(`comm/getCommsByNewsId?newsId=${index}&page=${this.pageIndex}&pageSize=${this.pageSize}`).then((res) => {
        if (res.data.success) {
          const _list = res.data.data
          if (_list.length) {
            if (Number(this.fromType) === 2) {
              this.commentList = []
              this.commentList.push(..._list.splice(0, 2))
              this.$refs.scroll.forceUpdate(false)
            } else {
              this.commentList.push(..._list)
              this.pageIndex++
            }
          } else {
            this.$refs.scroll.forceUpdate()
          }
        }
      })
    },

    reply(item) { // 回复详情
      if (this.flag === 1) {
        this.$router.push({
          query: {item: JSON.stringify(item)},
          path: '/replyDetail'
        })
      } else {
        this.noLogin()
      }
    },
    onScrollHandle(pos) {
      if (pos.y < -100) {
        this.isShowTop = true
      } else {
        this.isShowTop = false
      }
    },
    onPullingDown() {
      this.getCommentList()
    },
    findLocalDevice() {
      var loadDateTime = new Date();
      window.setTimeout(function () {
        var timeOutDateTime = new Date();
        if (timeOutDateTime - loadDateTime < 5000) {
          if (parseInt(this.$store.state.device) === 0) {
            window.location = "要跳转的安卓下载app页面URL";
          } else {
            window.location = "要跳转的iOS下载app页面URL";
          }
        } else {
          window.close();
        }
      }, 25);
      window.location = `stemCellWeb://checkNews?newsId=${this.detailsId}`;
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "../common/stylus/mixin.styl"
  .detail
    width 100vw
    height 100vh
    display flex
    flex-direction column
    &.noScrollLoad
      height auto
    .container
      flex 1
      position relative
      width 100%
      .scroll-list-wrap
        position absolute
        top 0
        left 0
        width 100%
        height 100%
        .no-padding
          padding-top 30px !important
        .article
          padding 70px 15px 0
          .title
            font-size 20px
            color #000
            font-weight bold
          .article-info
            margin-top 10px
            height 50px
            display flex
            flex-direction row
            justify-content space-between
            align-items center
            .info-left
              display flex
              flex-direction row
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

            .info-right
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
          .article-content
            margin-top 15px
            .text-content
              font-size 16px
              color #666
              line-height 1.6
            .article-bg
              margin-top 15px
              width 100%
          .article-tags
            margin-top 10px
            height 40px
            display flex
            align-items center
            flex-direction row
            border-1px(#ccc)
            padding-bottom 10px
            .dot
              width 10px
              height 10px
              border-radius 100%
              background-color #ccc
              margin-right 10px
            ul
              li
                float left
                margin-right 5px
                font-size 12px
                min-width 60px
                height 34px
                text-align center
                line-height 33px
                border-radius 14px
                letter-spacing 1.5px
                color #333
                border 1px solid #ccc
          .article-comment
            margin-top 15px
            padding-bottom 100px
            .title
              font-size 15px
              color #000
              font-weight bold
            ul
              li
                margin-top 16px
                display flex
                flex-direction row
                justify-content space-between
                padding-bottom 10px
                .left-li
                  display flex
                  flex-direction row
                  align-items flex-start
                  .avatar
                    width 30px
                    height 30px
                    margin-right 10px
                    border-radius 100%
                  .user-info
                    margin-top 2px
                    .user-name
                      font-size 12px
                      color #32508c
                    .comment-content
                      width 100%
                      margin 10px 0
                      font-size 15px
                      line-height 1.5
                      color #000
                    .other-info
                      font-size 12px
                      span
                        &.hasComment
                          text-align center
                          display inline-block
                          width 60px
                          height 20px
                          line-height 20px
                          border-radius 30px
                          border 1px solid #ccc
                          background-color #eee
                .right-li
                  position absolute
                  right 15px
                  display flex
                  flex-direction row
                  height 20px
                  .zan
                    width 18px
                    height 18px
                    background-size 18px 18px
                    &.like
                      bg-image('images/like')
                    &.noLike
                      bg-image('images/zan')
                  .zan-num
                    line-height 20px
                    margin-left 5px
                    font-size 12px
                    &.likeActive
                      color #ff5e6b
                    &.noLikeActive
                      color #000
      .hasOnePic
        height 100vh
      .hasTwoPic
        height 100vh
      .hasThreePic
        height 100vh
      .article-comment-input
        position fixed
        background-color #fff
        width 100%
        bottom 0
        padding 0 15px
        height 50px
        display flex
        flex-direction row
        justify-content space-between
        align-items center
        border-top .5px solid #ccc
        z-index 999
        &.nav-hide
          position: static !important;
        .ipt
          height 34px
          width 185px
          border-radius 30px
          color #000
          line-height 34px
          border 1px solid #ccc
          background-color #f7f7f7
          text-indent 15px
          transition width .3s cubic-bezier(0, 0, 0.2, 1)
          &.active
            width 80%
        .list
          flex 1
          display flex
          align-items center
          justify-content space-between
          padding: 0 15px;
          .msg-box
            position relative
            .msg-icon
              bg-image('images/msg')
              width 30px
              height 30px
              background-size 30px 30px
            .badge
              position absolute
              left 15px
              top -4px
              font-size 8px
              max-width 35px
              padding 1px 6px
              text-align center
              line-height 13px
              background-color #ff5e6b
              border-radius 8px
              color #fff
          .collection-icon
            width 30px
            height 30px
            background-size 30px 30px
            &.noCollection
              bg-image('images/noCollection')
            &.collection
              bg-image('images/collection')
          .share-icon
            bg-image('images/share')
            width 30px
            height 30px
            background-size 30px 30px
        .send-but
          flex 1
          .icon
            width 25px
            height 25px
            margin 0 auto
            background url("../assets/img/send-no.svg") no-repeat center
            background-size 100% 100%
            &.active
              background url("../assets/img/send-ok.svg") no-repeat center
              background-size 100% 100%
            img
              display block
              width 100%
              height 100%
      .genesis-btn
        width 100%
        height 65px
        margin 0 auto
        display flex
        align-items center
        justify-content center
        background-color #fff
        border-top 1px solid #ccc
        position fixed
        bottom 0
        left 0
        z-index 1
        .btn
          width 80%
          height 42px
          line-height 42px
          text-align center
          border-radius 36px
          color #6C90D5
          background-color #C7D7FC
</style>
