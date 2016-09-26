'use strict';

app.controller('HomeController', ['HomeService', '$state', '$window', '$scope', function(HomeService, $state, $window, $scope) {
  var vm = this;
  vm.$state = $state;
  $scope.game = {};
  $scope.game.inProgress = false;
  if ($window.localStorage.token) {
    vm.profile = HomeService.getProfile();
    vm.loggedIn = true;
  }
  vm.logout = function() {
    delete $window.localStorage.token;
    vm.loggedIn = false;
  };
}]);

app.controller("LoginController", ['LoginService', '$state', '$window', function(LoginService, $state, $window) {
  if ($window.localStorage.token) {
    $state.go('home');
  }
  var vm = this;
  vm.$state = $state;
  vm.user = {};
  vm.login = function() {
    LoginService.login(vm.user);
  };
}]);

app.controller("RegisterController", ['RegisterService', '$state', '$window', function(RegisterService, $state, $window) {
  if ($window.localStorage.token) {
    $state.go('home');
  }
  var vm = this;
  vm.newUser = {};
  vm.$state = $state;
  vm.register = function() {
    RegisterService.register(vm.newUser);
  };
}]);

app.controller("LeaderboardController", ['LeaderboardService', '$state', '$http', function(LeaderboardService, $state, $http) {
  var vm = this;
  vm.$state = $state;
  $http.get('https://phantom-mmesereau.herokuapp.com/leaders')
  .then(function(data) {
    vm.leaders = data.data;
    LeaderboardService.percentage(vm.leaders);
  })
  .catch(function(err) {
    console.log(err);
  });
  vm.wins = function() {
    LeaderboardService.wins(vm.leaders);
  };
  vm.losses = function() {
    LeaderboardService.losses(vm.leaders);
  };
  vm.percentage = function() {
    LeaderboardService.percentage(vm.leaders);
  };
}]);

app.controller("GameController", ['GameService', '$scope', '$state', function(GameService, $scope, $state) {
  var vm = this;
  vm.$state = $state;
  vm.playerNames = [];
  vm.startPnP = function() {
    for (var i = 0; i < vm.players; i++) {
      vm.playerNames.push("Player " + (i + 1));
    }
    vm.pnpinit = true;
  };
  vm.startGame = function() {
    $scope.game.inProgress = true;
      var game = new Phaser.Game($(window).width(), $(window).height(), Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

      var map, layer, sprites, line, turn, basic_attack, special_attack, move, shield, extra_turn, dig, capsule, turn_text, lava_done, capsules, flicker, time, notification, note, buttons, buttonsShow, digLine, gameOverNotification;
      var players = [];
      var notifications = [];
      function preload () {
        game.load.tilemap('map', 'assets/tilemaps/maps/tile_properties.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/tilemaps/tiles/gridtiles.png');
        game.load.image('sprite_1', 'assets/sprites/red_ball.png');
        game.load.image('sprite_2', 'assets/sprites/aqua_ball.png');
        game.load.image('sprite_3', 'assets/sprites/purple_ball.png');
        game.load.image('sprite_4', 'assets/sprites/blue_ball.png');
        game.load.image('sprite_5', 'assets/sprites/green_ball.png');
        game.load.image('sprite_6', 'assets/sprites/yellow_ball.png');
        game.load.image('basic_attack', 'assets/buttons/basic_attack.png');
        game.load.image('special_attack', 'assets/buttons/special_attack.png');
        game.load.image('move', 'assets/buttons/move.png');
        game.load.image('shield', 'assets/buttons/shield.png');
        game.load.image('dig', 'assets/buttons/dig.png');
        game.load.image('capsule', 'assets/buttons/capsule.png');
        game.load.image('extra_turn', 'assets/buttons/extra_turn.png');
        game.load.image('healthbar', 'assets/sprites/healthbar.png');
        game.load.image('sapbar', 'assets/sprites/sap.png');
        game.load.image('shield2', 'assets/sprites/shield2.png');
        game.load.image('gameover', 'assets/buttons/endgame.png');
      }

      function create () {
        game.physics.startSystem(Phaser.Physics.P2JS);
        map = game.add.tilemap('map');
        map.addTilesetImage('tiles');
        layer = map.createLayer('Tile Layer 1');
        sprites=['sprite_1', 'sprite_2', 'sprite_3', 'sprite_4', 'sprite_5', 'sprite_6'];
        for (var i = 0; i < vm.playerNames.length; i++) {
          players.push(game.add.sprite(Math.floor(Math.random() * $(window).width() / 40) * 32, Math.floor(Math.random() * $(window).height() / 33) * 32 + 1, sprites[Math.floor(Math.random() * sprites.length)]));
        }
        basic_attack = game.add.button($(window).width() - 200, 200, 'basic_attack', do_basic_attack, this);
        special_attack = game.add.button($(window).width() - 200, 250, 'special_attack', do_special_attack, this);
        shield = game.add.button($(window).width() - 200, 300, 'shield', do_shield, this);
        move = game.add.button($(window).width() - 200, 150, 'move', do_move, this);
        capsule = game.add.button($(window).width() - 200, 50, 'capsule', do_capsule, this);
        dig = game.add.button($(window).width() - 200, 100, 'dig', do_dig, this);
        extra_turn = game.add.button($(window).width() - 200, 0, 'extra_turn', do_extra_turn, this);
        turn_text = game.add.text(0, 0, "Filler Text", {font: "40px Arial", fill: "white"});
        line = new Phaser.Line(players[0].x, players[0].y, players[0].x, players[0].y);
        buttons=[basic_attack, special_attack, shield, move, capsule, dig, extra_turn];
        buttonsShow = true;
        layer.resizeWorld();
        map.setCollisionBetween(6, 34);
        game.physics.p2.convertTilemap(map, layer);
        game.physics.p2.gravity.y = 0;
        game.physics.p2.enable(line);
        for (var i = 0; i < players.length; i++) {
          game.physics.p2.enable(players[i]);
          players[i].key = vm.playerNames[i];
          players[i].turn = false;
          players[i].hp = 6;
          players[i].maxhp = 6;
          players[i].sap = 10;
          players[i].maxsap = 10;
          players[i].healthbar = players[i].addChild(game.make.sprite(0, -50, 'healthbar'));
          players[i].sapbar = players[i].addChild(game.make.sprite(0, -35, 'sapbar'));
          players[i].sapbar.width = 100;
          players[i].sapbar.height = 10;
          players[i].healthbar.width = 100;
          players[i].healthbar.height = 10;
          players[i].hpwidth = players[i].healthbar.width;
          players[i].sapwidth = players[i].sapbar.width;
        }
        turn = 0;
        capsules = ['health', 'wand', 'lava', 'death', 'wand', 'health'];
        notification = game.add.text(game.world.centerX, game.world.centerY, "Let the game begin!", {font: '64px Arial', fill: 'white'});
        gameOverNotification = game.add.text(game.world.centerX, game.world.centerY, "", {font: '75px Arial', fill: 'white'});
        note = setInterval(function() {
          notification.fontSize++;
          notification.x = game.world.centerX - notification.width / 2;
          notification.y = game.world.centerY - notification.height / 2;
        }, 1);
        generateMap();
      }

      function update() {
        for (var i = 0; i < players.length; i++) {
          players[i].body.setZeroVelocity();
          players[i].healthbar.width = players[i].hpwidth * players[i].hp / players[i].maxhp;
          players[i].sapbar.width = players[i].sapwidth * players[i].sap / players[i].maxsap;
          if (turn % players.length === i) {
            players[i].turn = true;
            turn_text.text = players[i].key + "\'s Turn";
            players[i].height = 30;
            players[i].width = 30;
            changeline(players[i]);
            players[i].healthbar.visible = true;
            players[i].sapbar.visible = true;
          }
          else if (!players[i].target) {
            players[i].turn = false;
            players[i].height = 17;
            players[i].width = 17;
            players[i].healthbar.visible = false;
            players[i].sapbar.visible = false;
          }
          else {
            players[i].turn = false;
          }
          if (Math.abs(players[i].x - game.input.activePointer.x) < players[i].width / 2 && Math.abs(players[i].y - game.input.activePointer.y) < players[i].height / 2) {
            players[i].healthbar.visible = true;
          }
        }
        if (Date.now() > time + 1000) {
          flicker = 0;
          for (i = 0; i < players.length; i++) {
            players[i].visible = true;
          }
        }
        if (notification.fontSize > 180) {
          clearInterval(note);
          note = 0;
          notification.text = "";
          notification.fontSize = 64;
          notifications.splice(0, 1);
          if (notifications.length > 0) {
            console.log(notifications);
            notify();
          }
        }
        for (i = 0; i < buttons.length; i++) {
          if (game.input.activePointer.x < buttons[i].x || game.input.activePointer.y > buttons[2].y + buttons[2].height || !buttonsShow) {
            buttons[i].visible = false;
          }
          else {
            buttons[i].visible = true;
          }
        }
        if (digLine) {
          digLine.setTo(digLine.start.x, digLine.start.y, game.input.activePointer.x, game.input.activePointer.y);
        }
        if (players.length === 1) {
          winner();
        }
      }

      function do_capsule() {
        buttonsShow = false;
        game.input.onDown.addOnce(do_capsule_2, this);
      }

      function do_capsule_2() {
        var x = Math.ceil(game.input.activePointer.x / 32 - 1);
        var y = Math.ceil(game.input.activePointer.y / 32 - 1);
        var tile = map.getTile(x, y, 'Tile Layer 1', true);
        if (tile.index === 34) {
          var index = Math.floor(Math.random() * capsules.length);
          notify(capsules[index]);
          if (capsules[index] === 'lava') {
            lava();
          }
          else if (capsules[index] === "death") {
            death();
          }
          else if (capsules[index] === "wand") {
            wand();
          }
          else if (capsules[index] === "health") {
            health();
          }
          else {
            alert("problem with if loop");
          }
          capsules.splice(capsules.indexOf(capsules[index]), 1);
        }
      }

      function health() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            players[i].hp = players[i].maxhp;
            players[i].sap = players[i].maxsap;
            var x = Math.ceil(game.input.activePointer.x / 32 - 1);
            var y = Math.ceil(game.input.activePointer.y / 32 - 1);
            map.replace(34, 1, x, y, 1, 1);
            nextTurn();
          }
        }
      }

      function wand() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            players[i].wand = 2;
            var x = Math.ceil(game.input.activePointer.x / 32 - 1);
            var y = Math.ceil(game.input.activePointer.y / 32 - 1);
            map.replace(34, 1, x, y, 1, 1);
            nextTurn();
          }
        }
      }

      function death() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            doDamage(players[i], 6);
          }
        }
        var x = Math.ceil(game.input.activePointer.x / 32 - 1);
        var y = Math.ceil(game.input.activePointer.y / 32 - 1);
        map.replace(34, 1, x, y, 1, 1);
        nextTurn();
      }

      function lava(x, y) {
        var init = false;
        if (typeof x !== 'number' && typeof y !== 'number') {
          init = true;
          x = Math.ceil(game.input.activePointer.x / 32 - 1);
          y = Math.ceil(game.input.activePointer.y / 32 - 1);
          lava_done = true;
        }
        var tile = map.getTile(x, y, 'Tile Layer 1', true);
        if ((init && tile.index === 34) || !init) {
          if (Math.floor(Math.random() * 2) === 0) {
            map.replace(tile.index, 85, x, y, 1, 1);
          }
          else {
            map.replace(tile.index, 2, x, y, 1, 1);
          }
          var surrounding = [map.getTile(x, y - 1, 'Tile Layer 1', true), map.getTile(x, y + 1, 'Tile Layer 1', true), map.getTile(x - 1, y, 'Tile Layer 1', true), map.getTile(x + 1, y, 'Tile Layer 1', true)];
          for (var i = 0; i < surrounding.length; i++) {
            if (surrounding[i] && surrounding[i].index === 1) {
              lava(surrounding[i].x, surrounding[i].y);
            }
          }
        }
        if (init) {
          for (var i = 0; i < players.length; i++) {
            if (!players[i].turn) {
              doDamage(players[i], 1);
            }
          }
          nextTurn();
        }
      }

      function do_dig() {
         buttonsShow = false;
        game.input.onDown.addOnce(do_dig_2, this);
      }

      function do_dig_2() {
        digLine = new Phaser.Line(game.input.activePointer.x, game.input.activePointer.y, game.input.activePointer.x, game.input.activePointer.y);
        game.input.onDown.addOnce(do_dig_3, this);
      }


      function do_dig_3() {
        buttonsShow = true;
        var coords = digLine.coordinatesOnLine(1);
        for (var i = 1; i < coords.length; i++) {
          var x = Math.ceil(coords[i][0] / 32 - 1);
          var y = Math.ceil(coords[i][1] / 32 - 1);
          map.replace(6, 1, x, y, 1, 1);
        }
        digLine = undefined;
        nextTurn();
      }


      function do_move() {
        buttonsShow = false;
        game.input.onDown.addOnce(do_move_2, this);
      }

      function do_move_2() {
        buttonsShow = true;
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            players[i].reset(game.input.activePointer.x, game.input.activePointer.y);
            console.log("move");
            nextTurn();
          }
        }
      }

      function do_extra_turn() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            if (players[i].sap >= 3) {
              players[i].extra_turn = true;
              players[i].sap -= 3;
            }
            else {
              alert("You do not have the Special Points necessary to do this.");
            }
          }
        }
      }

      function do_basic_attack() {
        buttonsShow = false;
        game.input.onDown.addOnce(do_basic_attack_2, this);
      }

      function do_basic_attack_2() {
        buttonsShow = true;
        for (var i = 0; i < players.length; i++) {
          if (players[i].target) {
            doDamage(players[i], 1);
            nextTurn();
          }
        }
      }

      function do_special_attack() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            if (players[i].sap >= 2 || (players[i].wand && players[i].wand > 0)) {
              buttonsShow = false;
              game.input.onDown.addOnce(do_special_attack_2, this);
            }
            else {
              alert("You do not have the Special Points necessary to do this.");
            }
          }
        }
      }

      function do_special_attack_2() {
        buttonsShow = true;
        for (var i = 0; i < players.length; i++) {
          for (var j = 0; j < players.length; j++) {
            if (players[i].target && players[j].turn) {
              console.log(players[j].key + "does 2 damage to " + players[i].key);
              doDamage(players[i], 2);
              if (players[j].wand && players[j].wand > 0) {
                players[j].wand--;
              }
              else {
                players[j].sap -= 2;
              }
              nextTurn();
            }
          }
        }
      }

      function do_shield() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            if (players[i].sap >= 2) {
              players[i].shield = 2;
              players[i].sap -= 2;
              nextTurn();
            }
            else {
              alert("You do not have the Special Points necessary to do this.");
            }
          }
        }
      }

      function changeline(player) {
        var x1 = player.x;
        var y1 = player.y;
        var x2 = game.input.activePointer.x;
        var y2 = game.input.activePointer.y;
        if (x2 && y2) {
          line.setTo(x1, y1, x2, y2);
        }
        else {
          line.setTo(x1, y1, x1, y1);
        }
        var coords = line.coordinatesOnLine(1);
        if (coords.length > 1) {
          for (var i = 1; i < coords.length; i++) {
            var tile = map.getTile(Math.ceil(coords[i][0] / 32 - 1), Math.ceil(coords[i][1] / 32 - 1), 'Tile Layer 1', true);
            if (tile) {
              if (tile.index === 34 || tile.index === 6 || tile.index === 12) {
                line.setTo(x1, y1, coords[i - 1][0], coords[i - 1][1]);
                break;
              }
            }
          }
        }
        target();
      }

      function target() {
        for (var j = 0; j < players.length; j++) {
          if (Math.abs(players[j].x - game.input.activePointer.x) < players[j].width / 2 && Math.abs(players[j].y - game.input.activePointer.y) < players[j].height / 2 && line.end.x === game.input.activePointer.x && line.end.y === game.input.activePointer.y) {
            players[j].width = 35;
            players[j].height = 35;
            players[j].target = true;
          }
          else if (!players[j].turn) {
            players[j].width = 17;
            players[j].height = 17;
            players[j].target = false;
          }
          else {
            players[j].target = false;
          }
        }
      }

      function nextTurn() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            if (players[i].extra_turn) {
              players[i].extra_turn = false;
            }
            else {
              lavaTest();
              turn++;
              turn = turn % players.length;
              if (players.length === 2 || Math.floor(Math.random() * 10) === 3) {
                shuffle();
              }
              else if (Math.floor(Math.random() * 10 === 7)) {
                phantomAttack();
              }
              else if (Math.floor(Math.random() * 10) === 5) {
                phantomHeal();
              }
            }
          }
        }
        buttonsShow = true;
      }

      function phantomHeal() {
        for (var i = 0; i < players.length; i++) {
          if (Math.floor(Math.random() * 2) === 1) {
            notify("PHANTOM HEALS " + players[i].key + "!");
            players[i].hp += 2;
            if (players[i].hp > players[i].maxhp) {
              players[i].hp = players[i].maxhp;
            }
          }
        }
      }

      function phantomAttack() {
        for (var i = 0; i < players.length; i++) {
          if (Math.floor(Math.random() * 2) === 1) {
            notify("PHANTOM ATTACKS " + players[i].key + "!");
            if (players[i].hp > 3) {
              doDamage(players[i], 3);
            }
            else {
              doDamage(players[i], players[i].hp - 1);
            }
          }
        }
      }

      function shuffle() {
        for (var i = 0; i < players.length; i++) {
          players[i].reset(Math.floor(Math.random() * $(window).width()), Math.floor(Math.random() * $(window).height()));
        }
        notify("SHUFFLE!");
      }

      function lavaTest() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            var x = Math.ceil(players[i].x / 32  - 1);
            var y = Math.ceil(players[i].y / 32  - 1);
            var tile = map.getTile(x, y, 'Tile Layer 1', true);
            if (tile.index === 85) {
              doDamage(players[i], 1);
            }
          }
        }
      }

      function doDamage(target, amt) {
        if (target.shield) {
          while (target.shield > 0) {
            target.shield--;
            amt--;
          }
        }
        if (amt > 0) {
          target.hp -= amt;
          time = Date.now();
          notify(target.key + " takes " + amt + " damage.");
          flicker = setInterval(function() {
            target.visible = !target.visible;
          }, 100);
        }
        if (target.hp <= 0) {
          notify(target.key + " dies.");
          // if (target.turn) {
          //   turn--;
          // }
          levelUp();
          target.visible = false;
          target.width = 0;
          target.kill();
          players.splice(players.indexOf(target), 1);
        }
      }

      function levelUp() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            if (players[i].hp !== 0) {
              notify(players[i].key + " levels up!");
            }
            players[i].hp += 2;
            players[i].maxhp += 2;
            players[i].sap += 3;
            players[i].maxsap += 3;
          }
        }
      }


      function render() {
          game.debug.geom(line);
      }

      function generateMap() {
        for (var i = 0; i < 6; i++) {
          var x = Math.floor(Math.random() * ($(window).width() / 32));
          var y = Math.floor(Math.random() * ($(window).height() / 32));
          map.replace(1, 34, x, y, 1, 1);
        }
        for (i = 1; i < Math.ceil($(window).height() / 32) + 1; i++) {
          for (var j = 1; j < Math.ceil($(window).width() / 32) + 1; j++) {
            if (Math.floor(Math.random() * 5) === 0) {
              map.replace(1, 6, j, i, 1, 1);
            }
          }
        }
      }

      function notify(string) {
        if (string) {
          notifications.push(string);
        }
        notification.text = notifications[0];
        notification.fontSize = 28;
        note = setInterval(function() {
          notification.fontSize++;
          notification.x = game.world.centerX - notification.width / 2;
          notification.y = game.world.centerY - notification.height / 2;
        }, 12);
      }

      function winner() {
        gameOverNotification.text = players[0].key + " has emerged victorious.  \nCongratulations, " + players[0].key + "!";
        gameOverNotification.x = game.world.centerX - gameOverNotification.width / 2;
        gameOverNotification.y = game.world.centerY - gameOverNotification.height / 2;
        players[0].x = game.world.centerX;
        players[0].y = game.world.centerY;
        var gameOver = game.add.button(game.world.centerX, game.world.centerY, 'gameover', endGame, this);
      }

        function endGame() {
          game.disableStep();
          game.destroy();
          $scope.game.inProgress = false;
        }
    };


}]);
