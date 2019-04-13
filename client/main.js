import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe('devices');
Meteor.subscribe('config');

var bpm = 60;





Template.body.helpers({
    devices: function() {
        return DevicesCollection.find({}, {sort: {deviceType: 1, deviceName: 1}});
    }
});

Template.beat_counter.helpers({
    config: function() {
        return ConfigCollection.find({_id: 'bpm'});
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
