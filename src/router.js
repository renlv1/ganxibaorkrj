import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/detail'
    },
    {
      path: '/detail',
      name: 'detail',
      component: () => import('./pages/detail')
    },
    { // 回复详情
      path: '/replyDetail',
      name: 'replyDetail',
      component: () => import('./pages/replyDetail')
    }
  ]
})

export default router
