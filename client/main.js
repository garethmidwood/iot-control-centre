import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe('devices');
var configHandle = Meteor.subscribe("config");

var beatTimeout;
var beatInitialised = false;

var soundHandle = Meteor.subscribe('sound');

var noteSequenceHandle = Meteor.subscribe('noteSequence');

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

        let noteSequencePointer = ConfigCollection.find({'_id':'noteSequencePointer'});
        let noteSequencePointerHandle = noteSequencePointer.observeChanges({
            changed: function (id, fields) {
                console.log(id);
                console.log(fields);
            }
        });
    }
    if (soundHandle.ready()) {
        let notes = SoundCollection.find();
        let handle = notes.observeChanges({
            changed: function (id, fields) {
                
            }
        });
    }
    if (noteSequenceHandle.ready()) {
        let noteSequenceCollection = NoteSequenceCollection.find();
        let handle = noteSequenceCollection.observeChanges({
            changed: function (id, fields) {
                let nextNote = parseInt(id) + 1;
                if(nextNote == 8){
                    nextNote = 0;
                }
                $('.nextNote').removeClass('nextNote');
                let nextNoteSelector = '.notes__note--' + nextNote;
                console.log(nextNoteSelector);
                $(nextNoteSelector).addClass('nextNote');
                console.log('changed note sequence');
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

Template.keyboard.helpers({
    currentNotes: function() {
        return NoteSequenceCollection.find({}, {sort: {_id: 1}});
    },
});

Template.currentNote.helpers({
    nextNote: function(){
        var recordCollection = ConfigCollection.find({'_id':'noteSequencePointer'}).fetch();
        var nextInSequence = 0;

        recordCollection.forEach(function(index){
            nextInSequence = index.value;
        });

        return nextInSequence;
    },
    variableMatches(var1,var2){
        return var1 == var2;
    }
});

window.touchElement = null;

document.addEventListener('touchstart', function(event) {
    event.preventDefault();
    window.touchElement = event.target;

    if(event.target.classList.contains('keyboardKey')) {
        addToSequence(event.target.innerHTML);
        pressKey(event.target);
    }

    if(event.target.classList.contains('clear')) {
        clearSequence();
    }

    if(event.target.classList.contains('send')) {
        sendToFlower();
    }

}, { passive: false });

document.addEventListener('touchmove', function(event) {
    var actualTarget = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);

    if(!actualTarget.isSameNode(window.touchElement)) {
        window.touchElement = actualTarget;

        if(actualTarget.classList.contains('keyboardKey')) {
            addToSequence(actualTarget.innerHTML);
            pressKey(actualTarget);
        }
    }
}, { passive: false });

function pressKey(keyElement) {
    keyElement.classList.add('pressed');
    setTimeout(function() {
        keyElement.classList.remove('pressed');
    }, 500);
}

function addToSequence(newNote){
    Meteor.call('pause', 1);
    Meteor.call('add_to_sequence', newNote);
}

function clearSequence(){
    Meteor.call('clear_sequence',1);
    Meteor.call('pause', 1);
}

function sendToFlower(){
    Meteor.call('play', 1);
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

function getSequenceCounter(){
    return sequenceCounter;
}



