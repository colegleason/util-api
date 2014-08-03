var _ = require('underscore');
var path = require('path');
var async = require('async');
var app = require('./app');
var User = require('./user');

function Beacon(data) {
    if (!(this instanceof Beacon)) {
        return new Beacon(data);
    }
    _.extend(this, data);

    if (this.users == undefined) {
        this.users = [];
    }
    if (this.devices == undefined) {
        this.devices = [];
    }
    if (this.name == undefined) {
        this.name = "default";
        console.log("made beacon with no name");
    }

    this.whitelist = ['name', 'users', 'devices'];

    this.save = function(cb) {
        app.store.set(Beacon)(_.pick(this, this.whitelist), this.name, cb);
    };

    this.addUser = function(username) {
        this.users.push(username);
        this.users = _.uniq(this.users);
        this.save();
    };

    this.addDevice = function(name) {
        this.devices.push(name);
        this.devices = _.uniq(this.devices);

        this.save();
    };

    // Returns all users near a beacon.
    this.nearbyUsers = function() {
        var result = [];
        this.users.forEach(function(username) {
            var user = User.get(username);
            if (!_.contains(_.pluck(result, 'name'),user.name)) {
                result.push(user);
            }
        });
        return _.uniq(result);
    };
    return this;
}
Beacon.path = 'beacons';
module.exports.path = Beacon.path;

module.exports.get = Beacon.prototype.get = app.store.get(Beacon);
module.exports.Beacon = Beacon;
