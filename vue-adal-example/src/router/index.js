import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import authentication from '../authentication'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld,
      meta: {
        requiresAuthentication: true
      }
    }
  ]
})

// Global route guard
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuthentication)) {
    // this route requires auth, check if logged in
    if (authentication.isAuthenticated()) {
      // only proceed if authenticated.
      next();
    } else {
      authentication.signIn();
    }
  } else {
    next();
  }
});

export default router;
