import { Meteor } from 'meteor/meteor';

var beatTimeout;
var noteSequencePointer = 0;
var nextInputSequencePointer = 0;
var paused = true;
var ledConfig = {
  'A':{
    'led':'0',
    'colours':{
      'r':255,
      'g':76,
      'b':77,
    },
  },
  'B':{
    'led':'1',
    'colours':{
      'r':255,
      'g':143,
      'b':5,
    }
  },
  'C':{
    'led':'2',
    'colours': {
      'r':250,
      'g':197,
      'b':33,
    }
  },
  'D':{
    'led':'3',
    'colours': {
      'r':78,
      'g':219,
      'b':19,
    }
  },
  'E':{
    'led':'4',
    'colours': {
      'r':53,
      'g':198,
      'b':253,
    }
  },
  'F':{
    'led':'5',
    'colours': {
      'r':108,
      'g':117,
      'b':255,
    }
  },
  'G':{
    'led':'6',
    'colours': {
      'r':191,
      'g':30,
      'b':255,
    }
  },
  'H':{
    'led':'7',
    'colours': {
      'r':254,
      'g':37,
      'b':144,
    }
  },
}
Meteor.publish("config", function() { return ConfigCollection.find({}); });

Meteor.publish("devices", function() { return DevicesCollection.find({}); });

Meteor.publish("noteSequence", function() { return NoteSequenceCollection.find({}); });


Meteor.publish("led1", function() { return Led1Collection.find({}); });
Meteor.publish("led2", function() { return Led2Collection.find({}); });
Meteor.publish("led3", function() { return Led3Collection.find({}); });
Meteor.publish("led4", function() { return Led4Collection.find({}); });
Meteor.publish("led5", function() { return Led5Collection.find({}); });
Meteor.publish("led6", function() { return Led6Collection.find({}); });
Meteor.publish("led7", function() { return Led7Collection.find({}); });
Meteor.publish("led8", function() { return Led8Collection.find({}); });


Meteor.publish("hue1", function() { return Hue1Collection.find({}); });
Meteor.publish("hue2", function() { return Hue2Collection.find({}); });
Meteor.publish("hue3", function() { return Hue3Collection.find({}); });
Meteor.publish("hue4", function() { return Hue4Collection.find({}); });
Meteor.publish("hue5", function() { return Hue5Collection.find({}); });
Meteor.publish("hue6", function() { return Hue6Collection.find({}); });


Meteor.publish("sound", function() { return SoundCollection.find({}); });


Meteor.onConnection(function (connection) {
   console.log("New DDP Connection:", connection.id);

   connection.onClose(function() {
      console.log("DDP Disconnect:", connection.id); 
      // console.log(DevicesCollection.findOne( { _id: connection.id } ));
      DevicesCollection.remove( { _id: connection.id } );
   });
});


Meteor.methods({
   'device_online': function(deviceName, deviceType) {
        DevicesCollection.insert({_id: this.connection.id, deviceName: deviceName, deviceType: deviceType});

        console.log('a ' + deviceType + ' is online, called ' + deviceName);
        return 'device is registered online';
   },
   'set_beat': function(beat) {
        console.log('submitted beat of ' + beat);
        ConfigCollection.update({_id: 'bpm'}, {value: beat});

        var pulseRate = 60000 / beat;

        setNewBeat(pulseRate);
        return 'beat is now ' + beat;
   },
   'clear_sequence': function(){
      // ConfigCollection.update({_id: 'bpm'}, {value: note});
      clearBeatSequences();
      return 'cleared_sequence';
   },
   'add_to_sequence': function(note){
      // ConfigCollection.update({_id: 'bpm'}, {value: note});
      console.log(note);
      addNoteToSequence(note);
      playNote({value:note});
      return note;
   },
   'pause': function() {
      paused = true;
      ConfigCollection.remove({_id:'isPaused'});
      ConfigCollection.insert({_id:'isPaused', value:paused});
   },
   'play': function() {
      paused = false;
      ConfigCollection.remove({_id:'isPaused'});
      ConfigCollection.insert({_id:'isPaused', value:paused});
   }
});


Meteor.startup(() => {
    // code to run on server at startup
    resetDevicesCollection();
    resetConfigCollection();
    resetNoteSequenceCollection();

    // default beat - 1second
    beat(1000);
});


function resetDevicesCollection() {
    console.log('Resetting device collection');
    DevicesCollection.remove({});
}

function resetConfigCollection() {
    console.log('Resetting config collection');
    ConfigCollection.remove({});
    ConfigCollection.insert({_id: 'bpm', value: 60});
}

function resetNoteSequenceCollection() {
    console.log('Resetting note sequence collection');
    noteSequencePointer = 0;
    nextInputSequencePointer = 0;

    ConfigCollection.remove({});
    ConfigCollection.insert({_id: 'noteSequencePointer',value:noteSequencePointer});

    NoteSequenceCollection.remove({});
    // insert some defaults
    NoteSequenceCollection.insert({_id: '0', value: null});
    NoteSequenceCollection.insert({_id: '1', value: null});
    NoteSequenceCollection.insert({_id: '2', value: null});
    NoteSequenceCollection.insert({_id: '3', value: null});
    NoteSequenceCollection.insert({_id: '4', value: null});
    NoteSequenceCollection.insert({_id: '5', value: null});
    NoteSequenceCollection.insert({_id: '6', value: null});
    NoteSequenceCollection.insert({_id: '7', value: null});  
}







function setNewBeat(pulseRate) {
  console.log('Setting new pulse rate to ' + pulseRate);
  Meteor.clearTimeout(beatTimeout);
  beat(pulseRate);
}

function beat(pulseRate) {
    beatTimeout = Meteor.setTimeout(function () {
        console.log('beat at ' + pulseRate);

        if(paused == false) {
          onBeat();
        }

        beat(pulseRate);
    }, pulseRate);
}

function onBeat() {
  // TODO: loop through devices on a cycle. 
  // needs a pointer per device type

  console.log('noteSequencePointer: ' + noteSequencePointer);

  var sequenceLength = NoteSequenceCollection.find({}).count();

  // reset note sequence pointer when it gets to the end of the sequence
  if (noteSequencePointer == sequenceLength){
    noteSequencePointer = 0;
  }
  // find the note to play
  // console.log('Looking for note sequence at position ' + noteSequencePointer);
  ConfigCollection.remove({_id: 'noteSequencePointer'});
  ConfigCollection.insert({_id: 'noteSequencePointer',value:noteSequencePointer});
  var currentNote = NoteSequenceCollection.findOne({_id: noteSequencePointer.toString()});
  // console.log('currentNote.value is... ' + currentNote.value);

  // if there's a defined note then we'll play it
  var nextToPlay = currentNote.value;
  console.log(typeof nextToPlay);
  if (currentNote.value){
    playNote(currentNote);
    console.log('playing'+currentNote.value);
    // clear collections 
    Led1Collection.remove({});

    var submitData = {
      led:noteSequencePointer,
      colours:ledConfig[currentNote.value]['colours']
    }
    console.log(submitData);
    Led1Collection.insert(submitData);
  }
  noteSequencePointer++;

}

// Resets the 'beat' sequence outputs
// currently just notes, will also include LED's in future.
function clearBeatSequences(){
  resetNoteSequenceCollection();
}


function addNoteToSequence(note){
  console.log('adding note to sequence');
  
  if (nextInputSequencePointer == 8) {
    nextInputSequencePointer = 0;
  }

  NoteSequenceCollection.update({_id: nextInputSequencePointer.toString()}, {value: note});
  nextInputSequencePointer++
}

function playNote(note) {
  SoundCollection.remove({});
  SoundCollection.insert({notes: note,instrument:'bells'});
}
