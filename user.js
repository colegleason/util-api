var _ = require('underscore');
var path = require('path');

var app = require('./app');

function User(data) {
    if (!(this instanceof User)) {
        return new User(arguments);
    }
    _.extend(this, data);

    this.save = function(cb) {
        app.store.set(User)(this.username, cb);
    };

    return this;
}

User.path = 'users';

module.exports.get = User.prototype.get = app.store.get(User);
module.exports.on = User.prototype.on = app.store.on(User);
