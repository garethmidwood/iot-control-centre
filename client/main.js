import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './main.html';

Meteor.subscribe('devices');
Meteor.subscribe('locations');

var configHandle = Meteor.subscribe("config");

var beatTimeout;
var beatInitialised = false;

Session.setDefault('isAdmin', false);
Session.setDefault('position', false);

// super secure admin page
if (window.location.pathname == '/admin') {
    Session.set('isAdmin', true);
}



Tracker.autorun(function() {
    if (configHandle.ready()) {
        // this will only ever return one record
        // so we can foreach it but treat like one record
        let query = ConfigCollection.find({_id: 'bpm'});

        if (!beatInitialised) {
            query.forEach(function(item) {
                // set the initial beat
                setNewBeat(60000 / item.value);
            });

            beatInitialised = true;
        }

        // we'll update the beat if the bpm config value changes
        let handle = query.observeChanges({
            changed: function (id, fields) {
                setNewBeat(60000 / fields.value);
            }
        });
    }
});



Template.body.helpers({
    devices: function() {
        return DevicesCollection.find({}, {sort: {deviceType: 1, deviceName: 1}});
    },
    isAdmin: function() {
        return Session.get('isAdmin');
    }
});

Template.beat_counter.helpers({
    config: function() {
        return ConfigCollection.findOne({_id: 'bpm'});
    }
});

Template.beat_controls.helpers({
    isPaused: function() {
        return ConfigCollection.findOne({_id:'isPaused'}).value;
    }
});

Template.beat_controls.events({
    'click button#beat-control-play': function() {
        console.log("You clicked a play button element");
        Meteor.call('play');
    },
    'click button#beat-control-pause': function() {
        console.log("You clicked a pause button element");
        Meteor.call('pause');
    },
    'click button#beat-control-reset': function() {
        console.log("You clicked a reset button element");
        Meteor.call('reset');
    }
}); 



Template.location_tiles.helpers({
    locations: function() {
        return LocationsCollection.find({});
    },
    positionSelected: function() {
        console.log('position selected', Session.get('position'));
        return Session.get('position');
    },
    positionIsActive: function() {
        if (!ConfigCollection.findOne({_id: 'activePositions'})) {
            return false;
        }
        
        var isActive = false;

        var currentPositions = ConfigCollection.findOne({_id: 'activePositions'});

        currentPositions.values.forEach(function(item) {
            // set the initial beat
            if (Session.get('position') == item) {
                isActive = true;
            }
        });

        return isActive;
    }
});

Template.location_tiles.events({
    'click a': function(event) {
        event.preventDefault();

        if ($(event.target).closest('#admin-locations').length > 0) {
            console.log('admin cannot choose a location');
            return;
        }

        if ($(event.target).hasClass('taken')) {
            console.log('this location is already taken');
            return;
        }
        
        var position = $(event.target).data('position');
        console.log("You clicked a tile element at position", position);
        
        Meteor.call('choose_location', position, function(error, result) {
            // 'result' is the method return value
            if (result) {
                console.log('setting position to ' + position);
                Session.set('position', position);
            }
        });
    }
});


Template.location.helpers({
    positionIsActive: function(positionToCheck) {
        if (!ConfigCollection.findOne({_id: 'activePositions'})) {
            console.log('no active positions on locations..');
            return false;
        }


        var isActive = false;

        var currentPositions = ConfigCollection.findOne({_id: 'activePositions'});

        currentPositions.values.forEach(function(item) {
            // set the initial beat
            if (positionToCheck == item) {
                isActive = true;
            }
        });

        return isActive;
    }
});
























function setNewBeat(pulseRate) {
    console.log('Setting new pulse rate to ' + pulseRate);
    Meteor.clearTimeout(beatTimeout);

    // set the beat counter transition rate to match the beat rate
    var animationPulseRate = pulseRate > 1000 ? 1000 : pulseRate;
    console.log('beat counter animation running at ' + animationPulseRate);
    $('.beat_counter').css("transition", "background-color " + animationPulseRate + "ms linear");

    beat(pulseRate);
}

function beat(pulseRate) {
    beatTimeout = Meteor.setTimeout(function () {
        onBeat();

        beat(pulseRate);
    }, pulseRate);
}

function onBeat() {
    $('.beat_counter').toggleClass('pulse');
}
