import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './main.html';

Meteor.subscribe('devices');
Meteor.subscribe('locations');

var configHandle = Meteor.subscribe("config");

var beatTimeout;

Session.setDefault('isAdmin', false);

// super secure admin page
if (window.location.pathname == '/admin') {
    Session.set('isAdmin', true);
}






Template.body.helpers({
    devices: function() {
        return DevicesCollection.find({}, {sort: {deviceType: 1, deviceName: 1}});
    },
    isAdmin: function() {
        return Session.get('isAdmin');
    }
});



Template.beat_controls.helpers({
    sequenceIsPaused: function() {
        if (!ConfigCollection.findOne({_id:'isPaused'})) {
            return true;
        }

        return ConfigCollection.findOne({_id:'isPaused'}).value;
    },
    dump_json: function() {
        // dump collection stuff in here for debugging
        
        // var locations = LocationsCollection.find({});
        // var locArray = [];

        // locations.forEach(function(item) {
        //     // if this users position is active then we'll return 
        //     // true so that we can do something visually ace
        //     locArray.push({_id: item._id, tier: item.tier, sessionId: item.sessionId})
        // });

        // return JSON.stringify(locArray);
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
    },
    'click button#beat-control-disconnect': function() {
        console.log("You clicked a disconnect button element");
        Meteor.call('disconnect');
    },
}); 



Template.sequence_controls.events({
    'click button#sequence-control-single': function() {
        console.log("You clicked sequence-control-single");
        Meteor.call('select-sequence-single');
    },
    'click button#sequence-control-tiered': function() {
        console.log("You clicked sequence-control-tiered");
        Meteor.call('select-sequence-tiered');
    },
    'click button#select-sequence-all': function() {
        console.log("You clicked select-sequence-all");
        Meteor.call('select-sequence-all');
    },



    'click button#sequence-control-graphics-abstract1': function() {
        console.log("You clicked sequence-control-graphics-abstract1");
        Meteor.call('set-graphic-abstract1');
    },
    'click button#sequence-control-graphics-abstract2': function() {
        console.log("You clicked sequence-control-graphics-abstract2");
        Meteor.call('set-graphic-abstract2');
    },
    'click button#sequence-control-graphics-abstract3': function() {
        console.log("You clicked sequence-control-graphics-abstract3");
        Meteor.call('set-graphic-abstract3');
    },
    'click button#sequence-control-graphics-abstract4': function() {
        console.log("You clicked sequence-control-graphics-abstract4");
        Meteor.call('set-graphic-abstract4');
    },
    'click button#sequence-control-graphics-abstract5': function() {
        console.log("You clicked sequence-control-graphics-abstract5");
        Meteor.call('set-graphic-abstract5');
    },
    'click button#sequence-control-graphics-abstract6': function() {
        console.log("You clicked sequence-control-graphics-abstract6");
        Meteor.call('set-graphic-abstract6');
    },

    'click button#sequence-control-graphics-logo1': function() {
        console.log("You clicked sequence-control-graphics-logo1");
        Meteor.call('set-graphic-logo1');
    },
    'click button#sequence-control-graphics-logo2': function() {
        console.log("You clicked sequence-control-graphics-logo2");
        Meteor.call('set-graphic-logo2');
    },

    'click button#sequence-control-graphics-colour1': function() {
        console.log("You clicked sequence-control-graphics-colour1");
        Meteor.call('set-graphic-colour1');
    },
    'click button#sequence-control-graphics-colour2': function() {
        console.log("You clicked sequence-control-graphics-colour2");
        Meteor.call('set-graphic-colour2');
    },
    'click button#sequence-control-graphics-colour3': function() {
        console.log("You clicked sequence-control-graphics-colour3");
        Meteor.call('set-graphic-colour3');
    },
    'click button#sequence-control-graphics-colour4': function() {
        console.log("You clicked sequence-control-graphics-colour4");
        Meteor.call('set-graphic-colour4');
    },
    'click button#sequence-control-graphics-colour5': function() {
        console.log("You clicked sequence-control-graphics-colour5");
        Meteor.call('set-graphic-colour5');
    }
}); 





Template.location_tiles.helpers({
    locations: function() {
        return LocationsCollection.find({});
    },
    positionSelected: function() {
        var sessionId = Meteor.default_connection._lastSessionId;
        
        var position = LocationsCollection.findOne({sessionId: sessionId});

        if (!position) {
            return false;
        }

        console.log('position selected', position._id);

        return position._id;   
    },
    positionIsActive: function() {
        if (!ConfigCollection.findOne({_id: 'activePositions'})) {
            return false;
        }
        
        var isActive = false;

        var activePositions = ConfigCollection.findOne({_id: 'activePositions'});
    
        var sessionId = Meteor.default_connection._lastSessionId;

        if (!sessionId) {
            console.log('session not set, can\'t get current position');
            return false;
        }

        var position = LocationsCollection.findOne({sessionId: sessionId});

        if (!position) {
            return false;
        }

        activePositions.values.forEach(function(item) {
            // if this users position is active then we'll return 
            // true so that we can do something visually ace
            if (position._id == item) {
                isActive = true;
            }
        });

        return isActive;
    },
    sequenceIsPaused: function() {
        if (!ConfigCollection.findOne({_id:'isPaused'})) {
            return true;
        }

        return ConfigCollection.findOne({_id:'isPaused'}).value;
    },
    selectedGraphic: function() {
        if (!ConfigCollection.findOne({_id:'selectedGraphic'})) {
            return true;
        }

        return ConfigCollection.findOne({_id:'selectedGraphic'}).value;
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

        console.log("You clicked a tile element at position", position,);
        
        Meteor.call('choose_location', position, function(error, result) {
            // 'result' is the method return value
            if (result) {
                console.log('setting position to ' + position);
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

