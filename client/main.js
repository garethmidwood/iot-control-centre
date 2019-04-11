import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe('options');

Template.body.helpers({
    totalVotes: function() {
        var total = 0;
        var options = OptionsCollection.find({});

        options.forEach(function(item) {
            total += (item.votes ? item.votes : 0);
        });

        return total;
    },
    options: function() {
        return OptionsCollection.find({});
    }
});





Template.body.events({
    'click button.reset'(event, instance) {
        var options = OptionsCollection.find({});

        options.forEach(function(item) {
            OptionsCollection.update(item._id, {$set: {votes: 0, winner: false}});
        });
    }
});





Template.option.helpers({
    votepercentage: function() {
        return  100 * (this.votes / 10);
    }
});


Template.option.events({
    'click button'(event, instance) {
        // increment the votes counter when button is clicked
        newVotes = 1 + (this.votes ? this.votes : 0);

        var isWinner = (newVotes >= 10);

        OptionsCollection.update(this._id, {$set: {votes: newVotes, winner: isWinner}});
    }
});
