import { Meteor } from 'meteor/meteor';

var beatTimeout;
var musicCounter = 0;
var sequenceCounter = 0;
var musicSequence = {};

Meteor.publish("config", function() { return ConfigCollection.find({}); });

Meteor.publish("devices", function() { return DevicesCollection.find({}); });

Meteor.publish("notes", function() { return NotesCollection.find({}); });


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
      clearSequence();
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
   },
   'get_sequence': function(musicSequence){
      // ConfigCollection.update({_id: 'bpm'}, {value: note});
      return musicSequence;
   },
   'get_sequence_counter': function(sequenceCounter){
      // ConfigCollection.update({_id: 'bpm'}, {value: note});
      return sequenceCounter;
   },
   'get_music_counter': function(musicCounter){
      // ConfigCollection.update({_id: 'bpm'}, {value: note});
      return musicCounter;
   }
});


Meteor.startup(() => {
    // code to run on server at startup
    console.log('Clearing all devices');
    DevicesCollection.remove({});

    console.log('Resetting config');
    ConfigCollection.remove({});
    ConfigCollection.insert({_id: 'bpm', value: 60});

    // default beat - 1second
    beat(1000);
});



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

  if(typeof musicSequence[0] != 'undefined'){
    console.log('musicCounter: '+musicCounter);
    console.log('sequenceCounter: '+sequenceCounter);
    console.log(musicSequence);
    if(musicCounter == sequenceCounter){
      musicCounter = 0;
    }
    currentNote = musicSequence[musicCounter];
    SoundCollection.remove({});
    SoundCollection.insert({notes: currentNote,instrument:'vibraphone'});
    musicCounter++;
  }
  // clear collections 
  Led1Collection.remove({});

  Led1Collection.insert({colour: "red"});
}

function clearSequence(){
  musicSequence = {};
  sequenceCounter = 0;
  musicCounter = 0;
}

function addNoteToSequence(note){
  if(sequenceCounter == 8){
    sequenceCounter = 0;
  }
  musicSequence[sequenceCounter] = note;
  sequenceCounter++
  console.log(musicSequence);
}
