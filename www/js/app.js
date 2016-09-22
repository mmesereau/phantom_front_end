'use strict';

var app = angular.module("Phantom", ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: '../templates/home.html',
      controller: 'HomeController',
      controllerAs: 'HC'
    })
    .state('login', {
      url: '/login',
      templateUrl: '../templates/login.html',
      controller: 'LoginController',
      controllerAs: 'LIC'
    })
    .state('register', {
      url: '/register',
      templateUrl: '../templates/register.html',
      controller: 'RegisterController',
      controllerAs: 'RC'
    })
    .state('leaderboard', {
      url: '/leaderboard',
      templateUrl: '../templates/leaderboard.html',
      controller: 'LeaderboardController',
      controllerAs: 'LC'
    })
    .state('pnp', {
      url: '/pnp',
      templateUrl: '../templates/passandplay.html',
      controller: 'GameController',
      controllerAs: 'GC'
    })
    .state('pnp-names', {
      url: '/pnp-names',
      templateUrl: '../templates/passandplayplayernames.html',
      controller: 'GameController',
      controllerAs: 'GC'
    });
});

app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
}]);
