import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe('devices');
var configHandle = Meteor.subscribe("config");

var beatTimeout;
var beatInitialised = false;

var soundHandle = Meteor.subscribe('sound');

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
    if (soundHandle.ready()) {
        let notes = SoundCollection.find();
        let sequenceHandle = notes.observeChanges({
            changed: function (id, fields) {
                
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

Template.keyboard.events({
    'click .keyboardKey'(event, instance) {
        // increment the votes counter when button is clicked
        addToSequence(event.currentTarget.innerHTML);

    },
    'click .clear'(event, instance) {
        // increment the votes counter when button is clicked
        clearSequence();
    }
});

function addToSequence(newNote){
    Meteor.call('add_to_sequence',newNote);
    get_sequence();
    get_sequence_counter();
    get_music_counter();
    
}
function clearSequence(){
    Meteor.call('clear_sequence',1);
}

function get_sequence(){
    var sequence = Meteor.call('get_sequence',1);
    console.log('sequence');
    console.log(sequence);
}
function get_sequence_counter(){
    var sequence_counter = Meteor.call('get_sequence_counter',1);
    console.log('sequence_counter');
    console.log(sequence_counter);
}
function get_music_counter(){
    var music_counter = Meteor.call('get_music_counter',1);
    console.log('music_counter');
    console.log(music_counter);
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

function clearSequence(){
  musicSequence = {};
  sequenceCounter = 0;
  musicCounter = 0;
  return true
}

function addNoteToSequence(note){
  if(sequenceCounter == 8){
    sequenceCounter = 0;
  }
  musicSequence[sequenceCounter] = note;
  sequenceCounter++
  console.log(musicSequence);
}



