'use strict';

app.service('HomeService', ['$window', '$state', function($window, $state) {
  var sv = this;
  sv.getProfile = function() {
    return JSON.parse(atob($window.localStorage.token.split('.')[1]));
  }
}]);

app.service('LoginService', ['$http', '$window', '$state', function($http, $window, $state) {
  var sv = this;
  sv.login = function(user) {
    $http.post('https://phantom-mmesereau.herokuapp.com/login', user)
    .then(function(data) {
      $window.localStorage.token = data.data.token;
      $state.go('home');
    })
    .catch(function(err) {
      sv.invalidLoginData = true;
      console.log(err);
    });
  };
}]);

app.service('RegisterService', ['$http', '$window', '$state', function($http, $window, $state) {
  var sv = this;
  sv.register = function(newUser) {
    if (newUser.username && newUser.nickname && newUser.password && newUser.repeatPassword) {
      if (newUser.password === newUser.repeatPassword) {
        var user = {
          username: newUser.username,
          nickname: newUser.nickname,
          password: newUser.password
        };
        $http.post('https://phantom-mmesereau.herokuapp.com/register', user)
        .then(function(data) {
          $window.localStorage.token = data.data.token;
          $state.go('home');
        })
        .catch(function(err) {
          console.log(err);
        });
      }
    }
  };
}]);

app.service('LeaderboardService', ['$window', '$state', '$http', function($window, $state, $http) {
  var sv = this;

  sv.wins = function(leaders) {
    leaders.sort(function(a, b) {
      return b.wins - a.wins;
    });
  };

  sv.losses = function(leaders) {
    leaders.sort(function(a, b) {
      return b.losses - a.losses;
    });
  };

  sv.percentage = function(leaders) {
    leaders.sort(function(a, b) {
      return - (a.wins / (a.wins + a.losses)) + (b.wins / (b.wins + b.losses));
    });
  };
}]);

app.service('GameService', ['$state', function($state) {
  var sv = this;
  
}])
