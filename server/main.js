import { Meteor } from 'meteor/meteor';

var beatTimeout;
var sequencePointer = 0;
var nextInputSequencePointer = 0;
var paused = true;

Meteor.publish("devices", function() { return DevicesCollection.find({}); });

Meteor.publish("config", function() { return ConfigCollection.find({}); });

Meteor.publish("locations", function() { return LocationsCollection.find({}); });










Meteor.onConnection(function (connection) {
   console.log("New DDP Connection:", connection.id);
   deviceOnline(connection.id);

   connection.onClose(function() {
      console.log("DDP Disconnect:", connection.id); 
      deviceOffline(connection.id);
   });
});





Meteor.methods({
  'is_admin': function() {
    var adminConfig = ConfigCollection.findOne({_id: 'admin'});

    return adminConfig.value == this.connection.id;
  },
  'choose_location': function(location) {
    var theLocation = location.toString();
    console.log('choosing location ', theLocation);

    var locationData = LocationsCollection.findOne(theLocation);
    
    if (locationData.value == null) {
      console.log('removing ', this.connection.id, ' from any existing locations');
      LocationsCollection.update({value: this.connection.id}, {value: null});

      console.log('giving position ', theLocation, ' to ', this.connection.id);
      LocationsCollection.update({_id: theLocation}, {value: this.connection.id});
      return true;
    } else {
      return false;
    }
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
    resetLocationsCollection();

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
  ConfigCollection.insert({_id: 'admin', value: null});
}

function resetLocationsCollection() {
  console.log('Resetting locations collection');
  LocationsCollection.remove({});
  LocationsCollection.insert({_id: "1", value: null});
  LocationsCollection.insert({_id: "2", value: null});
  LocationsCollection.insert({_id: "3", value: null});
  LocationsCollection.insert({_id: "4", value: null});
  LocationsCollection.insert({_id: "5", value: null});
  LocationsCollection.insert({_id: "6", value: null});
  LocationsCollection.insert({_id: "7", value: null});
  LocationsCollection.insert({_id: "8", value: null});
  LocationsCollection.insert({_id: "9", value: null});
  LocationsCollection.insert({_id: "10", value: null});
  LocationsCollection.insert({_id: "11", value: null});
  LocationsCollection.insert({_id: "12", value: null});
  LocationsCollection.insert({_id: "13", value: null});
  LocationsCollection.insert({_id: "14", value: null});
  LocationsCollection.insert({_id: "15", value: null});
  LocationsCollection.insert({_id: "16", value: null});
  LocationsCollection.insert({_id: "17", value: null});
  LocationsCollection.insert({_id: "18", value: null});
  LocationsCollection.insert({_id: "19", value: null});
  LocationsCollection.insert({_id: "20", value: null});
  LocationsCollection.insert({_id: "21", value: null});
  LocationsCollection.insert({_id: "22", value: null});
  LocationsCollection.insert({_id: "23", value: null});
  LocationsCollection.insert({_id: "24", value: null});
  LocationsCollection.insert({_id: "25", value: null});
  LocationsCollection.insert({_id: "26", value: null});
  LocationsCollection.insert({_id: "27", value: null});
  LocationsCollection.insert({_id: "28", value: null});
  LocationsCollection.insert({_id: "29", value: null});
  LocationsCollection.insert({_id: "30", value: null});
  LocationsCollection.insert({_id: "31", value: null});
  LocationsCollection.insert({_id: "32", value: null});
  LocationsCollection.insert({_id: "33", value: null});
  LocationsCollection.insert({_id: "34", value: null});
  LocationsCollection.insert({_id: "35", value: null});
}



function deviceOnline(connectionId) {
  DevicesCollection.insert( { _id: connectionId } );

  // if there is no admin, make this user the admin
  var adminConfig = ConfigCollection.findOne({_id: 'admin'});
  
  if (!adminConfig.value) {
    console.log('adding admin ' + connectionId);
    ConfigCollection.update({_id: 'admin'}, {value: connectionId});
    adminConfig = ConfigCollection.findOne({_id: 'admin'});
  }

  console.log('admin is ' + adminConfig.value);
}

function deviceOffline(connectionId) {
  DevicesCollection.remove( { _id: connectionId } );
  LocationsCollection.remove( { value: connectionId } );

  // if this is the admin, remove them from that config
  var adminConfig = ConfigCollection.findOne({_id: 'admin'});
  if (adminConfig.value == connectionId) {
    console.log('removing admin ' + connectionId);
    ConfigCollection.update({_id: 'admin'}, {value: null});
  }
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
  console.log('onBeat - sequencePointer to trigger: ' + sequencePointer);

  var sequenceLength = DevicesCollection.find({}).count();
  console.log('sequenceLength is ' + sequenceLength);

  // reset note sequence pointer when it gets to the end of the sequence
  if (sequencePointer == sequenceLength){
    sequencePointer = 0;
  }
  // find the note to play
  // console.log('Looking for note sequence at position ' + sequencePointer);
  ConfigCollection.remove({_id: 'sequencePointer'});
  ConfigCollection.insert({_id: 'sequencePointer',value: sequencePointer});

  sequencePointer++;
}



