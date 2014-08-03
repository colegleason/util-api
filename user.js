var _ = require('underscore');
var path = require('path');

var app = require('./app');
var Beacon = require('./beacon');

function User(data) {
    if (!(this instanceof User)) {
        return new User(arguments);
    }
    _.extend(this, data);

    var beacon = Beacon.get(this.beacon);
    if (beacon == null) {
        beacon = new Beacon.Beacon({name: this.beacon});
    }
    beacon.addUser(this.name);

    this.whitelist = ['name', 'beacon', 'devices', 'color', 'rgbcolor', 'vector','on'];

    this.save = function(cb) {
        app.store.set(User)(_.pick(this, this.whitelist),this.name, cb);
    };

    return this;
}

module.exports.path = User.path = 'users';

module.exports.get = User.prototype.get = app.store.get(User);
module.exports.on = User.prototype.on = app.store.on(User);
module.exports.User = User;
