var Firebase = require('firebase');
var path = require('path');

function Store(rootPath) {
    if (!(this instanceof Store)) {
        return new Store(rootPath);
    }

    this.baseRef = new Firebase(rootPath);
    this.get = function(model) {
        var st = this;
        return function(getPath, cb) {
            st.baseRef.child(path.join(model.path, getPath)).once('value', function(snap) {
                var data = snap.val();
                if (data == null) {

                    return cb(null);
                } else {
                    return cb(new model(data));
                };
            });
        };
    };


    this.set = function(model) {
        var st = this;
        return function(data, setPath, cb) {
            st.baseRef.child(path.join(model.path, setPath)).set(data, cb);
        };
    };


    this.update = function(model) {
        var st = this;
        return function(updatePath, data, cb) {
            st.baseRef.child(path.join(model.path, updatePath)).update(data, cb);
        };
    };


    this.on = function(model) {
        var st = this;
        return function(event, cb, errorcb) {
            st.baseRef.child(model.path).on(event, function(snap) {
                var data = snap.val();
                if (data == null) {
                    return cb(null);
                } else {
                    return cb(new model(data));
                };
            }, errorcb);
        };
    };

    return this;
}


module.exports.Store = Store;
