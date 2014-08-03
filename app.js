var path = require('path');

var Firebase = require('firebase');
var _ = require('underscore');

var root = 'https://ra.firebaseio.com';
var store = require('./store').Store(root);
module.exports.store = store;

var User = require('./user');
var Beacon = require('./beacon');
var Device = require('./device');

User.on('child_changed', trainAndSetState, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
});

User.on('child_added', trainAndSetState, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
});

var beaconDeviceMap = {};
var userHistory = {};

Device.on('value', function(devices) {
    _.each(_.keys(devices), function(device) {
        _.each(devices[device].beacons, function(beacon){
            if (beaconDeviceMap[beacon] == undefined) {
                beaconDeviceMap[beacon] = [];
            }
            beaconDeviceMap[beacon].push(device);
            beaconDeviceMap[beacon] = _.uniq(beaconDeviceMap[beacon]);
        });
    });
});

function trainAndSetState(user) {
    var devices = devicesForBeacons(user.beacons);
    devices.forEach(function(device) {
        var state = train(user, device);
        Device.get(device, function(deviceObj) {
            if (deviceObj != null) {
                deviceObj.update({state: state});
            }
        });
    });
}

function devicesForBeacons(beacons) {
    var result = [];
    _.each(beacons, function(beacon) {
        var devices = beaconDeviceMap[beacon];
        if (devices != undefined) {
            result = _.uniq(_.union(result, devices));
        }
    });
    return result;
}

function train(user, device) {
    return user.color;
}
