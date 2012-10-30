var events = require("events"),
    util = require("util");

var Player = require("./player"),
    Map = require("./map");

var Game = module.exports = function Game() {
  events.EventEmitter.call(this);

  this.clients = [];
  this.players = [];
  this.map = new Map();

  this.last_eid = 0;

  this.name = "Minecraft.JS";
  this.max_players = 25;
  this.mode = 0;
  this.difficulty = 0;

  this.world = {
    type: "flat",
    dimension: 0,
  };

  this.tick = setInterval(this.emit.bind(this, "tick"), 100);
};
util.inherits(Game, events.EventEmitter);

Game.prototype.get_eid = function get_eid() {
  return this.last_eid++;
};

Game.prototype.add_client = function add_client(client) {
  this.clients.push(client);

  this.emit("client:connect", client);
  client.emit("game:connect", this);

  client.on("close", this.remove_client.bind(this, client));
};

Game.prototype.remove_client = function remove_client(client) {
  var index = this.clients.indexOf(client);

  if (index !== -1) {
    this.clients.splice(index, 1);
  }

  this.emit("client:disconnect", client);
  client.emit("game:disconnect", this);
};

Game.prototype.add_player = function add_player(player) {
  this.players.push(player);

  this.emit("player:join", player);
  player.emit("game:join", this);
};

Game.prototype.remove_player = function remove_player(player) {
  var index = this.players.indexOf(player);

  if (index !== -1) {
    this.players.splice(index, 1);
  }

  this.emit("player:leave", player);
  player.emit("game:leave", this);
};