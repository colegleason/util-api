var Firebase = require('firebase');
var path = require('path');
var _ = require('underscore');

function Store(rootPath) {
    if (!(this instanceof Store)) {
        return new Store(rootPath);
    }
    this.localStore = {};

    this.baseRef = new Firebase(rootPath);
    this.get = function(model) {
        var st = this;
        return function(getPath) {
            getPath = String(getPath);
            getPath = getPath.replace('.', '');

            if (st.localStore[model.path] != undefined) {
                var result = st.localStore[model.path][getPath];
                if (result == undefined) {
                    console.log('Object does not exist', model.path, getPath);
                    return null;
                }
                return new model(result);
            } else {
                console.log('Model does not exist', model.path);
                return null;
            }
        };
    };


    this.set = function(model) {
        var st = this;
        return function(data, setPath, cb) {
            setPath = String(setPath);
            setPath = setPath.replace('.', '');
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
                    data.name = snap.name();
                    var modelObj = new model(data);
                    return cb(modelObj);
                };
            }, errorcb);
        };
    };

    this.register = function(model, cb) {
        this.localStore[model.path] = {};
        var st = this;
        var initial = true;
        this.baseRef.child(model.path).on('value', function(data) {
            var objects = data.val();
            st.localStore[model.path] = {};
            _.keys(objects).forEach(function(name) {
                objects[name].name = name;
                var modelObj = new model(objects[name]);
                st.localStore[model.path][name] = modelObj;
            });

            if (initial) {
                initial = false;
                cb();
            }
        });
    };

    return this;
}


module.exports.Store = Store;
