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
        console.log("training for user/device", user.name, device.name);
        var state = train(user, device);
    });
    resetDevices();
};

function getAllDevices() {
    var seen = {};
    var result = [];
    var devices = store.localStore.devices;
    _.keys(devices).forEach(function(deviceName) {
        if (!seen[deviceName]) {
            seen[deviceName] = true;
            result.push(new Device.Device(devices[deviceName]));
        }
    });
    return result;
}

function resetDevices() {
    var devices = getAllDevices();
    devices.forEach(function(device) {
        var users = device.nearbyUsers();
        var states = _.compact(_.pluck(_.filter(users, function(u) { return u.on; }), 'rgbcolor'));
        device.normalize(states, function(newState) {
            device.update({state: newState});
        });
    });
}

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
    return user.state;
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

    setInterval(resetDevices, 1000 * 1);
});
