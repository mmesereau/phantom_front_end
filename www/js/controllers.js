'use strict';

app.controller("GameController", [function() {
  var vm = this;
  vm.startGame = function() {
      var game = new Phaser.Game($(window).width(), $(window).height(), Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

      var map, layer, player_1, player_2, player_3, player_4, cursors, line, turn, players, basic_attack, special_attack, move, shield, extra_turn, dig, capsule, turn_text, lava_done, capsules, flicker, time;
      function preload () {
        game.load.tilemap('map', 'assets/tilemaps/maps/tile_properties.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/tilemaps/tiles/gridtiles.png');
        game.load.image('player_1', 'assets/sprites/red_ball.png');
        game.load.image('player_2', 'assets/sprites/aqua_ball.png');
        game.load.image('player_3', 'assets/sprites/purple_ball.png');
        game.load.image('player_4', 'assets/sprites/blue_ball.png');
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
      }

      function create () {
        game.physics.startSystem(Phaser.Physics.P2JS);
        map = game.add.tilemap('map');
        map.addTilesetImage('tiles');
        layer = map.createLayer('Tile Layer 1');
        player_1 = game.add.sprite(Math.floor(Math.random() * $(window).width() / 40) * 32, Math.floor(Math.random() * $(window).height() / 33) * 32 + 1, 'player_1');
        player_2 = game.add.sprite(Math.floor(Math.random() * $(window).width() / 40) * 32, Math.floor(Math.random() * $(window).height() / 33) * 32 + 1, 'player_2');
        player_3 = game.add.sprite(Math.floor(Math.random() * $(window).width() / 40) * 32, Math.floor(Math.random() * $(window).height() / 33) * 32 + 1, 'player_3');
        player_4 = game.add.sprite(Math.floor(Math.random() * $(window).width() / 40) * 32, Math.floor(Math.random() * $(window).height() / 33) * 32 + 1, 'player_4');
        basic_attack = game.add.button($(window).width() - 200, 200, 'basic_attack', do_basic_attack, this);
        special_attack = game.add.button($(window).width() - 200, 250, 'special_attack', do_special_attack, this);
        shield = game.add.button($(window).width() - 200, 300, 'shield', do_shield, this);
        move = game.add.button($(window).width() - 200, 150, 'move', do_move, this);
        capsule = game.add.button($(window).width() - 200, 50, 'capsule', do_capsule, this);
        dig = game.add.button($(window).width() - 200, 100, 'dig', do_dig, this);
        extra_turn = game.add.button($(window).width() - 200, 0, 'extra_turn', do_extra_turn, this);
        turn_text = game.add.text($(window).width() - 200, 350, "Filler Text", {font: "40px Arial", fill: "white"});
        line = new Phaser.Line(player_1.x, player_1.y, player_1.x, player_1.y);
        layer.resizeWorld();
        map.setCollisionBetween(6, 34);
        game.physics.p2.convertTilemap(map, layer);
        game.physics.p2.gravity.y = 0;
        game.physics.p2.enable(player_1);
        game.physics.p2.enable(player_2);
        game.physics.p2.enable(player_3);
        game.physics.p2.enable(player_4);
        game.physics.p2.enable(line);
        cursors = game.input.keyboard.createCursorKeys();
        players = [player_1, player_2, player_3, player_4];
        for (var i = 0; i < players.length; i++) {
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
        generateMap();
      }

      function update() {
        for (var i = 0; i < players.length; i++) {
          players[i].body.setZeroVelocity();
          players[i].healthbar.width = players[i].hpwidth * players[i].hp / players[i].maxhp;
          players[i].sapbar.width = players[i].sapwidth * players[i].sap / players[i].maxsap;
          if (turn % players.length === i) {
            players[i].turn = true;
            turn_text.text = players[i].key + "\'s \nTurn";
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
        }
        if (Date.now() > time + 1000) {
          clearInterval(flicker);
          for (i = 0; i < players.length; i++) {
            players[i].visible = true;
          }
        }
      }

      function do_capsule() {
        game.input.onDown.addOnce(do_capsule_2, this);
      }

      function do_capsule_2() {
        var x = Math.ceil(game.input.activePointer.x / 32 - 1);
        var y = Math.ceil(game.input.activePointer.y / 32 - 1);
        var tile = map.getTile(x, y, 'Tile Layer 1', true);
        if (tile.index === 34) {
          var index = Math.floor(Math.random() * capsules.length);
          alert(capsules[index]);
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
        game.input.onDown.addOnce(do_dig_2, this);
      }

      function do_dig_2() {
        var x = Math.ceil(game.input.activePointer.x / 32 - 1);
        var y = Math.ceil(game.input.activePointer.y / 32 - 1);
        var tile = map.getTile(x, y, 'Tile Layer 1', true);
        if (tile.index === 6) {
          map.replace(6, 1, x, y, 1, 1);
          nextTurn();
        }
      }


      function do_move() {
        game.input.onDown.addOnce(do_move_2, this);
      }

      function do_move_2() {
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
        game.input.onDown.addOnce(do_basic_attack_2, this);
      }

      function do_basic_attack_2() {
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
              game.input.onDown.addOnce(do_special_attack_2, this);
            }
            else {
              alert("You do not have the Special Points necessary to do this.");
            }
          }
        }
      }

      function do_special_attack_2() {
        for (var i = 0; i < players.length; i++) {
          for (var j = 0; j < players.length; j++) {
            if (players[i].target && players[j].turn) {
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
            players[j].healthbar.visible = true;
          }
          else if (!players[j].turn) {
            players[j].width = 17;
            players[j].height = 17;
            players[j].target = false;
            players[j].healthbar.visible = false;
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
              turn++;
              turn = turn % players.length;
              lavaTest();
              if (players.length === 2 || Math.floor(Math.random() * 10) === 3) {
                shuffle();
              }
            }
          }
        }
      }

      function shuffle() {
        for (var i = 0; i < players.length; i++) {
          players[i].reset(Math.floor(Math.random() * $(window).width()), Math.floor(Math.random() * $(window).height()));
        }
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
          flicker = setInterval(function() {
            target.visible = !target.visible;
          }, 100);
        }
        if (target.hp <= 0) {
          // if (target.turn) {
          //   turn--;
          // }
          levelUp();
          target.kill();
          players.splice(players.indexOf(target), 1);
        }
        console.log(target.key + " takes " + amt + " damage");
      }

      function levelUp() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
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
          var x = Math.floor(Math.random() * $(window).width() / 32);
          var y = Math.floor(Math.random() * $(window).width() / 32);
          map.replace(1, 34, x, y, 1, 1);
        }
        for (i = 0; i < Math.ceil($(window).height() / 32); i++) {
          for (var j = 0; j < Math.ceil($(window).width() / 32); j++) {
            if (Math.floor(Math.random() * 5) === 0) {
              map.replace(1, 6, j, i, 1, 1);
            }
          }
        }
      }


    };
}]);
