'use strict';

app.factory('authInterceptor', ['$q', '$window', function($q, $window) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      if ($window.localStorage.token) {
        config.headers.Authorization = "Bearer " + $window.localStorage.token;
        console.log(config.headers.Authorization);
      }
      return config;
    },
    response: function(response) {
      if (response.status === 401) {
        delete $window.localStorage.token;
      }
      return response || $q.when(response);
    }
  };
}]);
