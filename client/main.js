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

        Meteor.call('is_admin', function(error, result) {
            // 'result' is the method return value
            Session.set('isAdmin', result);
        });



        let locations = LocationsCollection.find({});
        let locationsHandle = locations.observeChanges({
            changed: function (id, fields) {
                console.log('location changed');
                console.log(id);
                console.log(fields);
            }
        });

        

        let sequencePointer = ConfigCollection.find({_id: 'sequencePointer'});
        let sequencePointerHandle = sequencePointer.observeChanges({
            changed: function (id, fields) {
                console.log(id);
                console.log(fields);
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


Template.beat_controls.events({
    'click button#beat-control-play': function() {
        console.log("You clicked a play button element");
        Meteor.call('play', 1);
    },
    'click button#beat-control-pause': function() {
        console.log("You clicked a pause button element");
        Meteor.call('pause', 1);
    }
}); 



Template.location_tiles.helpers({
    locations: function() {
        return LocationsCollection.find({});
    }
});

Template.location_tiles.events({
    'click a': function(event) {
        event.preventDefault();
        
        var position = $(event.target).data('position');
        console.log("You clicked a tile element at position", position);
        
        Meteor.call('choose_location', position, function(error, result) {
            // 'result' is the method return value
            if (result) {
                console.log('setting position to ' + position);
                Session.set('position', result);
            }
        });
    }
});



// Template.currentNote.helpers({
//     nextNote: function(){
//         if(isPaused()) {
//             return -1;
//         }

//         var recordCollection = ConfigCollection.find({'_id':'sequencePointer'}).fetch();
//         var nextInSequence = 0;

//         recordCollection.forEach(function(index){
//             nextInSequence = index.value;
//         });

//         return nextInSequence;
//     },
//     variableMatches(var1,var2){
//         return var1 == var2;
//     }
// });






function clearSequence(){
    Meteor.call('clear_sequence',1);
    Meteor.call('pause', 1);
}























function isPaused(){
    var config = ConfigCollection.find({'_id':'isPaused'}).fetch();

    if(typeof config[0] != 'undefined' && typeof config[0].value != 'undefined') {
        return config[0].value;
    }

    return true;
}

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
