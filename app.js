var path = require('path');

var Firebase = require('firebase');
var _ = require('underscore');
var async = require('async');
var root = 'https://ra.firebaseio.com';
var store = require('./store').Store(root);
module.exports.store = store;

var User = require('./user');
var Beacon = require('./beacon');
var Device = require('./device');

function trainAndSetState(user) {
    console.log("training for user", user.name);
    var devices = devicesForBeacon(user.beacon);
    devices.forEach(function(device) {
        console.log("training for user/device", user.name, device);
        var state = train(user, device);
        var users = device.nearbyUsers();
        var states = _.compact(_.pluck(users, 'rgbcolor'));
        device.normalize(states, function(newState) {
            console.log(newState);
            device.update({state: newState});
        });
    });
};


function devicesForBeacon(beaconName) {
    var beacon = Beacon.get(beaconName);
    if (beacon == null) {
        console.log("beacon not found ", beaconName);
        return [];
    }
    return _.map(beacon.devices, function(deviceName) {
        return Device.get(deviceName);
    });
}

function train(user, device) {
    user.state = user.rgbcolor;
    return user.rgbcolor;
}

// Reurns all state objects for a given set of users.
function getAllStates(usernames) {
    var result = [];
    _.each(usernames, function(username) {
        User.get(username, function(user) {
            result.push(user.state);
        });
    });
    return result;
}

async.series(
[
    function(cb) {store.register(Beacon.Beacon, cb); },
    function(cb) {store.register(User.User, cb); },
    function(cb) {store.register(Device.Device, cb); }
], function() {
    console.log("registered models");
    User.on('child_changed', trainAndSetState, function (errorObject) {
        console.log('The read failed: ' + errorObject.code);
    });

    User.on('child_added', trainAndSetState, function (errorObject) {
        console.log('The read failed: ' + errorObject.code);
    });
});
