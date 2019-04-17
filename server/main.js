import { Meteor } from 'meteor/meteor';

var beatTimeout;
var noteSequencePointer = 0;
var nextInputSequencePointer = 0;

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
      return note;
   },
   'play_music': function(){
      playMusic();
      return 'sequence submitted';
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

        onBeat();

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
  console.log('Looking for note sequence at position ' + noteSequencePointer);
  var currentNote = NoteSequenceCollection.findOne({_id: noteSequencePointer.toString()});
  console.log('currentNote.value is... ' + currentNote.value);

  // if there's a defined note then we'll play it
  if (typeof currentNote.value != 'undefined'){
    SoundCollection.remove({});
    SoundCollection.insert({notes: currentNote,instrument:'vibraphone'});
    noteSequencePointer++;
  }

  // clear collections 
  Led1Collection.remove({});
  Led1Collection.insert({colour: "red"});
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
