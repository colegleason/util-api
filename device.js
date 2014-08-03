var _ = require('underscore');
var path = require('path');
var rybColorMixer = require('ryb-color-mixer');
var async = require('async');
var color = require("onecolor");

var app = require('./app');
var Beacon = require('./beacon');

function Device(data) {
    if (!(this instanceof Device)) {
        return new Device(arguments);
    }
    _.extend(this, data);

    this.save = function(cb) {
        app.store.set(Device)(this.name, cb);
    };

    this.update = function(data, cb) {
        app.store.update(Device)(this.name, data, cb);
    };

    // Returns all users associated with a device.
    this.nearbyUsers = function(device, cb) {
        var beacon = Beacon.get(this.beacon);
        var users = beacon.nearbyUsers();
        return _.uniq(users);
    };

    this.normalize = function(states, cb) {
        var rgbColors = _.map(states, function(state) {
            var rgb = new color.RGB(state[0], state[1], state[2]);
            return rgb.hex();
        });
        if (rgbColors.length == 0) {
            return cb([0,0,0]);
        }
        var mixed = rybColorMixer.mix(rgbColors, {result: 'rgb'});
         return cb(mixed);
    };

    var beacon = Beacon.get(this.beacon);
    if (beacon == null) {
        beacon = new Beacon.Beacon({name: this.beacon});
    }
    beacon.addDevice(this.name);
    return this;
}
module.exports.path = Device.path = 'devices';

module.exports.get = Device.prototype.get = app.store.get(Device);
module.exports.on = Device.prototype.on = app.store.on(Device);
module.exports.Device = Device;
