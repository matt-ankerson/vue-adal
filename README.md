# vue-adal
An example project showcasing usage of the excellent ADAL JS library in a Vue JS application.

### ADAL wrapper module (`vue-adal-example/src/authentication/index.js`):

Set up configuration for your Azure Active Directory Application:
``` JavaScript
const config = {
  tenant: 'your aad tenant',
  clientId: 'your aad application client id',
  redirectUri: 'base uri for this application',
  cacheLocation: 'localStorage'
};
```
The initialize function should be called on page load - before the app is created.
Usage: `authentication.initialize().then(_ => {/* Create app */});`
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
    this.authenticationContext.acquireToken('<azure active directory resource id>', (error, token) => {
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
  this.authenticationContext.acquireTokenRedirect('<azure active directory resource id>');
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

