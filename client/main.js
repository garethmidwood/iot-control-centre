import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe('devices');
var configHandle = Meteor.subscribe("config");

var beatTimeout;
var beatInitialised = false;


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
    }
});

Template.beat_counter.helpers({
    config: function() {
        return ConfigCollection.findOne({_id: 'bpm'});
    }
});


/*
Template.body.events({
    'click button.reset'(event, instance) {
        var options = DevicesCollection.find({});

        options.forEach(function(item) {
            DevicesCollection.update(item._id, {$set: {votes: 0, winner: false}});
        });
    }
});
*/





/*
Template.device.events({
    'click button'(event, instance) {
        // increment the votes counter when button is clicked
        newVotes = 1 + (this.votes ? this.votes : 0);

        var isWinner = (newVotes >= 10);

        DevicesCollection.update(this._id, {$set: {votes: newVotes, winner: isWinner}});
    }
});
*/





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



