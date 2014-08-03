var _ = require('underscore');
var path = require('path');

var app = require('./app');

function Beacon(data) {
    if (!(this instanceof Beacon)) {
        return new Beacon(data);
    }
    _.extend(this, data);

    this.save = function(cb) {
        app.store.set(this)(this.name, cb);
    };

    return this;
}
Beacon.path = 'beacon';

module.exports.get = Beacon.prototype.get = app.store.get(Beacon);
