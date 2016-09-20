'use strict';

var app = angular.module("Phantom", []);

app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
}]);
