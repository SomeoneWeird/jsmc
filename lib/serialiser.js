var Concentrate = require("concentrate"),
    Steez       = require("steez"),
    util        = require("util");

function S() {

  if (!(this instanceof S)) { return new S(); }
  Concentrate.call(this);

}

util.inherits(S, Concentrate);

S.prototype.mcstring16 = function mcstring16(data) {

  var l = data.length,
      b = new Buffer(data, "ucs2");

  for (var i=0;i<l;++i) {

    var t = b[i*2+1];
    b[i*2+1] = b[i*2];
    b[i*2] = t;

  }

  return this.uint16be(l).buffer(b);

};

S.prototype.mcstrings = function mcstrings(data) {

  this.int16be(data.length);

  data.forEach(function(e) {

    this.mcstring16(e);

  }.bind(this));

  return this;

}

S.prototype.mcabsint = function mcabsint(data) {

  return this.int32be(Math.round(data * 32));

};

S.prototype.mcabsbyte = function mcabsbyte(data) {

  return this.int8(Math.round(data * 32));

};

S.prototype.mcbytedegree = function mcbytedegree(data) {

  return this.uint8(Math.round(data / 360 * 255));

};

S.prototype.mcmetadata = function mcmetadata(data) {

  data.forEach(function(e) {

    var k = e[1];

    if (e[0] === "byte") {

      this.uint8(k).int8(e[2]);

    }

    if (e[0] === "short") {

      k |= 32;
      this.uint8(k).int16be(e[2]);

    }

    if (e[0] === "int") {

      k |= 64;
      this.uint8(k).int32be(e[2]);

    }

    if (e[0] === "float") {

      k |= 96;
      this.uint8(k).floatbe(e[2]);

    }

    if (e[0] === "string16") {

      k |= 128;
      this.uint8(k).mcstring16(e[2]);

    }

    if (e[0] === "slot") {

      k |= 160;
      this.uint8(k).int32be(e[2][0]).int8(e[2][1]).int32be(e[2][2]);

    }

    if (e[0] === "ints") {

      k |= 192;
      this.uint8(k).int32be(e[2][0]).int32be(e[2][1]).int32be(e[2][2]);

    }

  }.bind(this));

  return this.uint8(0x7f);

};

S.prototype.mcints = function mcints(ints) {

  this.uint8(ints.length);

  ints.forEach(function(e) {

    this.uint32be(e);

  }.bind(this));

  return this;

};

S.prototype.mcbytes = function mcbytes(bytes) {

  this.int16be(bytes.length);

  bytes.forEach(function(e) {

    this.uint8(e);

  }.bind(this));

  return this;

};

S.prototype.mcslot = function mcslot(slot) {

  this.int16be(slot.block);

  if (slot.block === -1) {

    return this;

  }

  this.uint8(slot.count).int16be(slot.damage);

  if (!slot.metadata) {

    this.int16be(-1);

  } else {

    this.uint16be(slot.metadata.length).buffer(slot.metadata);

  }

  return this;

};

S.prototype.mcslots = function mcslots(slots) {

  slots.forEach(this.mcslot.bind(this));

  return this;

};

var Serialiser = module.exports = function Serialiser() {

  Steez.call(this);

};

util.inherits(Serialiser, Steez);

Serialiser.prototype.write = function write(packet) {

  switch (packet.pid) {

    case 0x00: {

      this.emit("data", S().uint8(packet.pid).uint32be(packet.token).result());
      break;

    }

    case 0x01: {

      this.emit("data", S().uint8(packet.pid).uint32be(packet.eid).mcstring16(packet.level_type).uint8(packet.game_mode).uint8(packet.dimension).uint8(packet.difficulty).uint8(0).uint8(packet.max_players).result());
      break;

    }

    case 0x03: {

      this.emit("data", S().uint8(packet.pid).mcstring16(packet.message).result());
      break;

    }

    case 0x05: {

      this.emit("data", S().uint8(packet.pid).int16be(packet.slot_number).mcslot(packet.slot).result());
      break;

    }
    
    case 0x06: {

      this.emit("data", S().uint8(packet.pid).int32be(packet.x).int32be(packet.y).int32be(packet.z).result());
      break;

    }

    case 0x08: {

      this.emit("data", S().uint8(packet.pid).floatbe(packet.health).int16be(packet.food).floatbe(packet.saturation).result());
      break;

    }

    case 0x09: {

      this.emit("data", S().uint8(packet.pid).int32be(packet.dimension).int8(packet.difficulty).int8(packet.game_mode).int16be(packet.world_height).mcstring16(packet.level_type).result());
      break;

    }

    case 0x10: {

      this.emit("data", S().uint8(packet.pid).int16be(packet.item).result());
      break;

    }

    case 0x0b: {

      this.emit("data", S().uint8(packet.pid).doublebe(packet.x).doublebe(packet.y).doublebe(packet.stance).doublebe(packet.z).result());
      break;

    }

    case 0x0d: {

      this.emit("data", S().uint8(packet.pid).doublebe(packet.x).doublebe(packet.stance).doublebe(packet.y).doublebe(packet.z).floatbe(packet.yaw).floatbe(packet.pitch).uint8(packet.on_ground).result());
      break;

    }

    case 0x10: {

      this.emit("data", S().uint8(packet.pid).int16be(packet.slot_id).result());
      break;

    }

    case 0x12: {

      this.emit("data", S().uint8(packet.pid).uint32be(packet.eid).uint8(packet.animation).result());
      break;

    }

    case 0x14: {

      this.emit("data", S().uint8(packet.pid).uint32be(packet.eid).mcstring16(packet.name).mcabsint(packet.x).mcabsint(packet.y).mcabsint(packet.z).mcbytedegree(packet.yaw).mcbytedegree(packet.pitch).uint16be(packet.current_item).mcmetadata(packet.metadata).result());
      break;

    }

    case 0x17: {

      this.emit("data", S().uint8(packet.pid).uint32be(packet.eid).uint8(packet.type).uint(packet.x).uint(packet.y).uint(packet.z).uint8(packet.pitch).uint8(packet.yaw).uint(packet.data).result());
      break;

    }

    case 0x18: {

      this.emit("data", S().uint8(packet.pid).uint32be(packet.eid).uint8(packet.type).uint(packet.x).uint(packet.y).uint(packet.z).uint8(packet.yaw).uint8(packet.pitch).uint(packet.data).uint16be(packet.speed_x).uint16be(packet.speed_y).uint16be(packet.speed_z).mcmetadata(packet.metadata).result());
      break;

    }

    case 0x1d: {

      this.emit("data", S().uint8(packet.pid).mcints(packet.entities).result());
      break;

    }

    case 0x21: {

      this.emit("data", S().uint8(packet.pid).uint32be(packet.eid).mcabsbyte(packet.x).mcabsbyte(packet.y).mcabsbyte(packet.z).mcbytedegree(packet.yaw).mcbytedegree(packet.pitch).result());
      break;

    }

    case 0x22: {

      this.emit("data", S().uint8(packet.pid).uint32be(packet.eid).mcabsint(Math.round(packet.x)).mcabsint(Math.round(packet.y)).mcabsint(Math.round(packet.z)).mcbytedegree(packet.yaw).mcbytedegree(packet.pitch).result());
      break;

    }

    case 0x27: {

      this.emit("data", S().uint8(packet.pid).int32be(packet.eid).int32be(packet.vid).uint8(packet.leash).result());
      break;

    }

    case 0x28: {

      this.emit("data", S().uint8(packet.pid).int32be(packet.eid).mcmetadata(packet.metadata).result());
      break;

    }

    case 0x2c: {

      // needs properties
      this.emit("data", S().uint8(packet.pid).int32be(packet.eid).int32be(packet.properties_count).result());
      break;

    }

    case 0x33: {

      this.emit("data", S().uint8(packet.pid).int32be(packet.x).int32be(packet.z).uint8(packet.solid).uint16be(packet.primary_bitmap).uint16be(packet.add_bitmap).uint32be(packet.data.length).buffer(packet.data).result());
      break;

    }

    case 0x35: {

      this.emit("data", S().uint8(packet.pid).uint32be(packet.x).uint8(packet.y).uint32be(packet.z).int16be(packet.type).uint8(packet.metadata).result());
      break;

    }

    case 0x38: {

      // needs data + meta info
      this.emit("data", S().uint8(packet.pid).int16be(packet.column_count).int32be(packet.data.length).result());
      break;

    }

    case 0x3f: {

      this.emit("data", S().uint8(packet.pid).mcstring16(packet.particle_name).floatbe(packet.x).floatbe(packet.y).floatbe(packet.z).floatbe(packet.x_offset).floatbe(packet.y_offset).floatbe(packet.z_offset).floatbe(packet.speed).uint32be(packet.number).result());
      break;

    }

    case 0x46: {

      this.emit("data", S().uint8(packet.pid).uint8(packet.reason).uint8(packet.game_mode).result());
      break;

    }

    case 0x64: {

      this.emit("data", S().uint8(packet.pid).uint8(packet.window).uint8(packet.type).mcstring16(packet.title).uint8(packet.slots).uint8(packet.use_title).uint32be(packet.eid).result());
      break;

    }

    case 0x65: {

      this.emit("data", S().uint8(packet.pid).uint8(packet.window).result());
      break;

    }

    case 0x67: {

      this.emit("data", S().uint8(packet.pid).int8(-1).int16be(packet.slot).mcslot(packet.data).result());
      break;

    }

    case 0x68: {

      this.emit("data", S().uint8(packet.pid).int8(0).int16be(packet.count).mcslots(packet.slots).result());
      break;

    }

    case 0x69: {

      this.emit("data", S().uint8(packet.pid).uint8(packet.window).int16be(packet.property).int16be(packet.value).result());
      break;

    }

    case 0x6b: {

      this.emit("data", S().uint8(packet.pid).int16be(packet.slot).mcslot(packet.item).result());
      break;

    }

    case 0x83: {

      this.emit("data", S().uint8(packet.pid).int16be(packet.item_type).int16be(packet.item_id).mcbytes(packet.text).result());
      break;

    }

    case 0x85: {

      this.emit("data", S().uint8(packet.pid).uint8(packet.eid).uint32be(packet.x).uint32be(packet.y).uint32be(packet.z).result());
      break;

    }

    case 0xc8: {

      this.emit("data", S().uint8(packet.pid).uint32be(packet.id).uint32be(packet.amount).result());
      break;

    }

    case 0xc9: {

      this.emit("data", S().uint8(packet.pid).mcstring16(packet.name).uint8(packet.online).int16be(packet.ping).result());
      break;

    }

    case 0xca: {

      this.emit("data", S().uint8(packet.pid).uint8(packet.flags).floatbe(packet.flying_speed).floatbe(packet.walking_speed).result());
      break;

    }

    case 0xcb: {

      this.emit("data", S().uint8(packet.pid).mcstring16(packet.text).result());
      break;

    }

    case 0xce: {

      this.emit("data", S().uint8(packet.pid).mcstring16(packet.objective_name).mcstring16(packet.objective_value).uint8(packet.create_remove).result());
      break;

    }

    case 0xcf: {

      this.emit("data", S().uint8(packet.pid).mcstring16(packet.item_name).uint8(packet.update_remove).mcstring16(packet.score_name).uint8(packet.value).result());
      break;

    }

    case 0xd0: {

      this.emit("data", S().uint8(packet.pid).uint8(packet.position).mcstring16(packet.score_name).result());
      break;

    }

    case 0xd1: {

      var data = S().uint8(packet.pid).mcstring16(packet.team_name).uint8(packet.mode);

      if(packet.mode == 0 || packet.mode == 2) {

        data.mcstring16(packet.team_display_name);
        data.mcstring16(packet.team_prefix);
        data.mcstring16(packet.team_suffix);
        data.uint8(packet.friendly_fire);

      }

      if(packet.mode == 0 || packet.mode == 3 || packet.mode == 4) {

        data.mcstrings(packet.players);

      }

      this.emit("data", data.result());

    }

    case 0xfe: {

      this.emit("data", S().uint8(packet.pid).result());
      break;

    }

    case 0xff: {

      this.emit("data", S().uint8(packet.pid).mcstring16(packet.message).result());
      break;

    }
  }

  return !this.paused && this.writable;

};
