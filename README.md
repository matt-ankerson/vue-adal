# vue-adal
An example project showcasing usage of the excellent [ADAL JS](https://github.com/AzureAD/azure-activedirectory-library-for-js) library in a Vue JS application.

### ADAL wrapper module:
`vue-adal-example/src/authentication/index.js`

Set up configuration for your Azure Active Directory application:
``` JavaScript
const config = {
  tenant: 'your aad tenant',
  clientId: 'your aad application client id',
  redirectUri: 'base uri for this application',
  cacheLocation: 'localStorage'
};
```
The initialize function should be called on page load - before the app is created.
Usage: `initialize().then(_ => {/* Create app */});`
``` JavaScript
initialize() {
  this.authenticationContext = new AuthenticationContext(config);

  return new Promise((resolve, reject) => {
    if (this.authenticationContext.isCallback(window.location.hash) || window !== window.parent) {
      // redirect to the location specified in the url params.
      this.authenticationContext.handleWindowCallback();
    } else {
      var user = this.authenticationContext.getCachedUser();
      if (user && window.parent === window && !window.opener) {
        // great, we have a user.
      } else {
        // no user, kick off the sign in flow.
        this.signIn();
      }
      resolve();
    }
  });
},
```
Gets an access token for some resource (usually an API you want your SPA to consume). The resource identifier should be associated with another Azure Active Directory application which represents the resource you're requesting:
``` JavaScript
acquireToken() {
  return new Promise((resolve, reject) => {
    this.authenticationContext.acquireToken('resource id', (error, token) => {
      if (error || !token) {
        return reject(error);
      } else {
        return resolve(token);
      }
    });
  });
},
```
In the event that the current user has not accepted the permissions granted to access the requested resource - an interactive authentication request can be invoked with this function:
``` JavaScript
acquireTokenRedirect() {
  this.authenticationContext.acquireTokenRedirect('resource id');
},
```
Verify whether the user has been properly authenticated:
``` JavaScript
isAuthenticated() {
  // getCachedToken will only return a valid, non-expired token.
  if (this.authenticationContext.getCachedToken(config.clientId)) { return true; }
  return false;
},
```
Gets the current users JWT token/profile which will contain user information, assigned groups and app roles. Usage: `getUserProfile().then(profile => {/* Do something with the profile */});`
``` JavaScript
getUserProfile() {
  if (!this.userProfilePromise) {
    this.userProfilePromise = this.initialize().then(() => {
      return this.authenticationContext.getCachedUser().profile;
    });
  }
  return this.userProfilePromise;
},
```
Wrapper functions to invoke log in and log out actions:
``` JavaScript
signIn() {
  this.authenticationContext.login();
},
signOut() {
  this.authenticationContext.logOut();
}
```

### In the app's entry point:
`vue-adal-example/src/main.js`
``` JavaScript
import Vue from 'vue'
import App from './App'
import router from './router'
import authentication from './authentication'

authentication.initialize().then(_ => {
  new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
  });
});

```

Optional - save the user profile in a state store (like Vuex):
``` JavaScript
auth.getUserProfile().then(profile => {
  store.commit('SET_USER_PROFILE', { profile: profile });
});
``` 

### Vue Router
`vue-adal-example/src/router/index.js`

* Enable history mode (disable usage of hashes (#) in the url).
* Include a meta field to facilitate authentication checking.

[Vue Router documentation](https://router.vuejs.org/en/)

``` JavaScript
const router = new Router({
  mode: 'history',  // Use history mode to stop vue-router from using a hash in the url.
                    // This is necessary to allow adal's redirect to work.
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
```
Check for the route's meta field `requiresAuthentication`:
``` JavaScript
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
```

### In your Vue components
Use functions from ADAL in your Vue components to drive the view. i.e. - `v-if="isAuthenticated"`
``` JavaScript
computed: {
  isAuthenticated() {
    return authentication.isAuthenticated();
  }
},
methods: {
  logOut() {
    authentication.signOut();
  }
}
```

### Requesting an access token for a protected resource
ADAL's `acquireToken` function can be used to get a valid token. The following example uses [Vue Resource](https://github.com/pagekit/vue-resource) to set up a http interceptor (not included in sample code).
``` JavaScript
Vue.http.interceptors.push(function (request, next) {
  auth.acquireToken().then(token => {
    // Set default request headers for every request
    request.headers.set('Content-Type', 'application/json');
    request.headers.set('Ocp-Apim-Subscription-Key', 'api key');
    request.headers.set('Authorization', 'Bearer ' + token)
    // continue to next interceptor
    next();
  });
});
```
