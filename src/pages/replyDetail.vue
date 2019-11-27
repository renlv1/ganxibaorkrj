<template>
  <div>
    <div class="header">
      <div class="close" @click="back"></div>
      <div class="title">{{commentNum === 0 ? '暂无回复' : `${commentNum}条回复`}}</div>
    </div>
    <div class="reply-content">
      <div class="lz-content">
        <div class="left-li">
          <img class="avatar" :src="info.userImgUrl" />
          <div class="user-info">
            <p class="user-name">{{info.userName}}<span class="btn">楼主</span></p>
            <p class="comment-content">{{info.commentContent}}</p>
            <p class="other-info">{{$changeDate(info.createAt,'-',8)}} {{$changeDate(info.createAt,'-',6)}}</p>
          </div>
        </div>
        <div class="right-li" @click="giveGreat(info)">
          <div class="zan" :class="[info.praiseFlag ? 'like': 'noLike']"></div>
          <div class="zan-num" :class="[info.giveLike ? 'likeActive': 'noLikeActive']">{{Number(info.praiseCount) >
            999 ?
            '999+' : info.praiseCount}}
          </div>
        </div>
      </div>
      <!-- 分割线 -->
      <div class="line"></div>
      <div class="reply-list">
        <ul v-if="Number(commentNum) !== 0">
          <li v-for="list in replyList" :key="list.index">
            <div class="left-li">
              <img class="avatar" :src="list.userImgUrl" />
              <div class="user-info">
                <p class="user-name">{{list.userName}}</p>
                <p class="comment-content" @click="comment(name)">{{list.commentContent}}</p>
                <p class="other-info">{{$changeDate(list.createAt,'-',8)}} {{$changeDate(list.createAt,'-',6)}}</p>
                <!-- 评论回复列表 -->
                <ul v-if="list.childCommentList" class="list-comment">
                  <li class="list" v-for="childList in list.childCommentList" :key="childList.index" @click="replyChild(childList.user)">
                    <div class="li-top">
                      <div class="top-left">
                        <span class="reply-user">{{childList.replyUser}}</span>
                        <span class="arrow"></span>
                        <span class="user">{{childList.user}}：</span>
                      </div>
                      <div class="top-right">
                        {{childList.date}}
                      </div>
                    </div>
                    <div class="li-bottom">{{childList.commentContent}}</div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="right-li" @click="giveGreat(list)">
              <div class="zan" :class="[list.praiseFlag === 1 ? 'like': 'noLike']"></div>
              <div class="zan-num" :class="[list.praiseFlag === 1 ? 'likeActive': 'noLikeActive']">{{Number(list.praiseCount) > 999 ?
                '999+' : list.praiseCount}}
              </div>
            </div>
          </li>
        </ul>
        <p class="no-data" v-if="Number(commentNum) === 0">暂无回复...</p>
      </div>
    </div>
    <div class="reply-input">
      <input ref="ipt" class="ipt" :class="{'active': sendShow}" v-model="msg" placeholder="说两句..." @keypress.enter.native="submit(msg)" @blur="blurFn" @input="getFocus" @focus="getFocus"/>
      <div class="send-but" v-show="sendShow" @click.stop="sendComment(info.id)">
        <div class="icon" :class="{'active': iconShow}"></div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: "replyDetail",
  data() {
    return {
      msg: '',
      page: 1,
      info: JSON.parse(this.$route.query.item),
      commentNum: 0,
      replyList: [],
      sendShow: false,
      iconShow: false,
      focusShow: true,
      pageSize: 20
    }
  },
  mounted() {
    this.queryReply(this.info.id)
  },
  methods: {
    apply(id) { // 调用客户端回复
      this.$refs.ipt.focus()
      this.sendComment(id)
    },
    blurFn() {},
    replyChild() {
      this.$refs.ipt.focus()
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
    back() {
      this.$router.back()
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
          this.getCommentList()
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
    queryReply(index) {
      this.$https.get(`comm/getCommsBySourceCommId?sourceCommId=${index}&page=${this.page}&pageSize=${this.pageSize}`).then((res) => {
        this.replyList = res.data.data
        this.commentNum = res.data.data.length
      })
    },
    sendComment(id) {
      this.$https.post(`comm/addcomm?newsId=${this.info.newsId}&commnetSourceId=${id}&commentContent=${this.msg}`).then((res) => {
        if (res.data.success) {
          this.msg = ''
          this.iconShow = false
          this.queryReply(this.info.id)
        }
      })
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "../common/stylus/mixin.styl"
  .header
    background-color #fff
    position fixed !important
    width 100%
    z-index 1
    display flex
    flex-direction row
    padding 0 15px
    height 50px
    justify-content center
    align-items center
    border-1px(#ccc)
    .close
      position absolute
      left 15px
      width 25px
      height 25px
      background-size 25px 25px
      bg-image('images/close')
    .title
      font-size 16px
  .reply-content
    padding 70px 15px 50px
    .lz-content
      position relative
      padding-bottom 15px
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
            .btn
              font-size 10px
              margin-left 8px
              padding .5px 6px
              border 1px solid #32508c
              border-radius 6px
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
                border-radius 30px
                border 1px solid #ccc
                background-color #eee
      .right-li
        top 0
        position absolute
        right 0
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
    .line
      height 5px
      left 0
      background-color #e2e2e2
      width 100%
      position absolute
    .reply-list
      padding-top 10px
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
                line-height 1.4
                color #000
              .other-info
                font-size 12px
                span
                  &.hasComment
                    text-align center
                    display inline-block
                    width 60px
                    height 20px
                    border-radius 30px
                    border 1px solid #ccc
                    background-color #eee
              .list-comment
                margin-top 15px
                padding 5px 10px
                height 100%
                background-color #e2e2e2
                .list
                  display flex
                  flex-direction column
                  margin 5px 0 12px
                  padding 0
                  &:last-child
                    margin-bottom 5px
                  .li-top
                    display flex
                    flex-direction row
                    align-items center
                    justify-content space-between
                    font-size 12px
                    .top-left
                      .arrow
                        margin 0 8px
                        display inline-block
                        bg-image('images/arrow')
                        width 9px
                        height 10px
                        background-size 9px 10px
                    .top-right
                        color #666
                  .li-bottom
                    margin-top 5px
                    font-size 14px
                    color #666
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
      .no-data
        text-align center
        margin-top 20px
        color #666
  .reply-input
    position fixed !important
    background-color #fff
    width 100%
    bottom 0
    padding 0 15px
    height 50px
    display flex
    flex-direction row
    justify-content space-between
    align-items center
    border-top-1px(#ccc)
    .ipt
      height 34px
      width 100%
      border-radius 30px
      color #000
      line-height 34px
      border 1px solid #ccc
      background-color #f7f7f7
      text-indent 15px
      transition width .3s cubic-bezier(0, 0, 0.2, 1)
      &.active
        width 90%
    .send-but
      flex 1
      .icon
        position absolute
        right 15px
        width 25px
        height 25px
        transform translateY(-50%)
        background url("../assets/img/send-no.svg") no-repeat center
        background-size 100% 100%
        &.active
          background url("../assets/img/send-ok.svg") no-repeat center
          background-size 100% 100%
        img
          display block
          width 100%
          height 100%
</style>
