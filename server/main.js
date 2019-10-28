import { Meteor } from 'meteor/meteor';

var beatTimeout;
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
  'choose_location': function(location) {
    var theLocation = location.toString();
    console.log('choosing location ', theLocation);

    var locationData = LocationsCollection.findOne(theLocation);
    
    if (locationData.sessionId == null) {
      console.log('removing ', this.connection.id, ' from any existing locations');
      LocationsCollection.update({sessionId: this.connection.id}, { $set: { sessionId: null } } );

      console.log('giving position ', theLocation, ' to ', this.connection.id);
      LocationsCollection.update({_id: theLocation}, { $set: { sessionId: this.connection.id } } );
      return true;
    } else {
      return false;
    }
  },
  'pause': function() {
    paused = true;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});
  },
  'play': function() {
    paused = false;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});
  },
  'reset': function() {
    paused = true;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});
    ConfigCollection.update({_id:'activePositions'}, { values: [0]});
  },
  'disconnect': function() {
    paused = true;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});
    ConfigCollection.update({_id:'activePositions'}, { values: [0]});
    resetLocationsCollection();
  },




  'select-sequence-single': function() {
    console.log('switching to single sequence');
    paused = true;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});   
    ConfigCollection.update({_id:'selectedSequence'}, { value: 'single-regular'});
  },
  'select-sequence-tiered': function() {
    console.log('switching to tiered sequence');
    paused = true;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});   
    ConfigCollection.update({_id:'selectedSequence'}, { value: 'tiered'});
  },
  'select-sequence-ticker': function() {
    console.log('switching to ticker sequence');
    paused = true;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});   
    ConfigCollection.update({_id:'selectedSequence'}, { value: 'ticker'});
  },
  'select-sequence-all': function() {
    console.log('switching to "all" sequence');
    paused = true;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});   
    ConfigCollection.update({_id:'selectedSequence'}, { value: 'all'});
  },

    // beats for different gifs:
    // GIF durations:
    // abstract1.gif: 3390 milliseconds
    // abstract2.gif: 4050 milliseconds
    // abstract3.gif: 1140 milliseconds
    // Logo-1.gif: 1830 milliseconds
    // logo-2.gif: 3180 milliseconds

  'set-graphic-abstract1': function() {
    console.log('switching to graphic abstract1');
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'abstract1'});
    setNewBeat(3390);
  },
  'set-graphic-abstract2': function() {
    console.log('switching to graphic abstract2');
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'abstract2'});
    setNewBeat(4050);
  },
  'set-graphic-abstract3': function() {
    console.log('switching to graphic abstract3');
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'abstract3'});
    setNewBeat(1140);
  },
  'set-graphic-abstract4': function() {
    console.log('switching to graphic abstract4');
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'abstract4'});
    setNewBeat(6750);
  },
  'set-graphic-abstract5': function() {
    console.log('switching to graphic abstract5');
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'abstract5'});
    setNewBeat(4800);
  },
  'set-graphic-abstract6': function() {
    console.log('switching to graphic abstract6');
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'abstract6'});
    setNewBeat(2820);
  },
  'set-graphic-logo1': function() {
    console.log('switching to graphic logo1');
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'logo1'});
    setNewBeat(1830);
  },
  'set-graphic-logo2': function() {
    console.log('switching to graphic logo2');
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'logo2'});
    setNewBeat(3300);
  },
  'set-graphic-colour1': function() {
    console.log('switching to graphic colour1');
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'colour1'});
    setNewBeat(1880);
  },
  'set-graphic-colour2': function() {
    console.log('switching to graphic colour2');
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'colour2'});
    setNewBeat(1880);
  },
  'set-graphic-colour3': function() {
    console.log('switching to graphic colour3');
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'colour3'});
    setNewBeat(1880);
  },
  'set-graphic-colour4': function() {
    console.log('switching to graphic colour4');
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'colour4'});
    setNewBeat(1880);
  },
  'set-graphic-colour5': function() {
    console.log('switching to graphic colour5');
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'colour5'});
    setNewBeat(1880);
  }
});




Meteor.startup(() => {
    // code to run on server at startup
    resetDevicesCollection();
    resetConfigCollection();
    resetLocationsCollection();

    // set a default beat - 1second = 1000
    // we're using the beat for the abstract1 graphic, as that's what we reset to
    beat(3390); 
});


function resetDevicesCollection() {
  console.log('Resetting device collection');
  DevicesCollection.remove({});
}

function resetConfigCollection() {
  console.log('Resetting config collection');
  ConfigCollection.remove({});
  ConfigCollection.insert({_id: 'isPaused', value: true});
  ConfigCollection.insert({_id: 'activePositions', values: [0]});
  ConfigCollection.insert({_id: 'selectedSequence', value: 'single-regular'});
  ConfigCollection.insert({_id: 'selectedGraphic', value: 'abstract1'});
}

function resetLocationsCollection() {
  console.log('Resetting locations collection');
  LocationsCollection.remove({});
  LocationsCollection.insert({_id: "1", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "2", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "3", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "4", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "5", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "6", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "7", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "8", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "9", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "10", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "11", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "12", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "13", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "14", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "15", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "16", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "17", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "18", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "19", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "20", tier: 1, sessionId: null});
  LocationsCollection.insert({_id: "21", tier: 2, sessionId: null});
  LocationsCollection.insert({_id: "22", tier: 2, sessionId: null});
  LocationsCollection.insert({_id: "23", tier: 2, sessionId: null});
  LocationsCollection.insert({_id: "24", tier: 2, sessionId: null});
  LocationsCollection.insert({_id: "25", tier: 2, sessionId: null});
  LocationsCollection.insert({_id: "26", tier: 2, sessionId: null});
  LocationsCollection.insert({_id: "27", tier: 2, sessionId: null});
  LocationsCollection.insert({_id: "28", tier: 2, sessionId: null});
  LocationsCollection.insert({_id: "29", tier: 2, sessionId: null});
  LocationsCollection.insert({_id: "30", tier: 2, sessionId: null});
  LocationsCollection.insert({_id: "31", tier: 3, sessionId: null});
  LocationsCollection.insert({_id: "32", tier: 3, sessionId: null});
  LocationsCollection.insert({_id: "33", tier: 3, sessionId: null});
  LocationsCollection.insert({_id: "34", tier: 3, sessionId: null});
  LocationsCollection.insert({_id: "35", tier: 3, sessionId: null});
}



function deviceOnline(connectionId) {
  DevicesCollection.insert( { _id: connectionId } );
}

function deviceOffline(connectionId) {
  DevicesCollection.remove( { _id: connectionId } );
  LocationsCollection.update({sessionId: connectionId}, { $set: {sessionId: null} });
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
  var selectedSequence = ConfigCollection.findOne('selectedSequence');

  switch(selectedSequence.value) {
    case 'ticker':
      sequenceTicker();
      break;
    case 'tiered':
      sequenceSingleRegularTiered();
      break;
    case 'all':
      sequenceAll();
      break;
    case 'single-regular':
    default:
      sequenceSingleRegular();
  }
}




/***
 *
 *  TODO: When changing the sequence, ALL pointers need to be reset
 *
 ***/



function sequenceSingleRegular() {
  var currentPointerValues = ConfigCollection.findOne({_id: 'activePositions'}).values;

  console.log('Running single regular sequence, pointer values: ', currentPointerValues);

  // there should only be one item, so use the first value in the array
  currentPointer = currentPointerValues[0];

  // increment it
  currentPointer++;

  // length of this sequence is the total number of locations
  var sequenceLength = LocationsCollection.find({}).count();

  // reset note sequence pointer when it gets to the end of the sequence
  if (currentPointer > sequenceLength){
    currentPointer = 1;
  }
  
  // update the active pointer
  // we only have one active pointer at a time
  ConfigCollection.update({_id: 'activePositions'}, {values: [currentPointer]});
}


function sequenceAll() {
  var sequenceLength = LocationsCollection.find({}).count();

  theValues = [];

  for (var i = 1; i <= sequenceLength; i++) {
    theValues.push(i);
  }

  ConfigCollection.update({_id: 'activePositions'}, {values: theValues});
}




// runs a regular pattern independently for each tier
function sequenceSingleRegularTiered() {
  var currentPointerValues = ConfigCollection.findOne({_id: 'activePositions'}).values;

  console.log('Running single regular tiered sequence, pointer values: ', currentPointerValues);

  // if we're starting from scratch we'll have a single '0' position,
  // we need to replace it with one for each tier
  if (currentPointerValues.length != 3) {
    currentPointerValues = [0,0,0];
  }

  // get the next steps for each tier
  var tier1Pointer = getTierNextStep(1, currentPointerValues[0]);
  var tier2Pointer = getTierNextStep(2, currentPointerValues[1]);
  var tier3Pointer = getTierNextStep(3, currentPointerValues[2]);
  
  // update the active pointer
  // we only have one active pointer at a time
  ConfigCollection.update({_id: 'activePositions'}, {values: [tier1Pointer, tier2Pointer, tier3Pointer]});
}

function getTierNextStep(tierNumber, tierCurrentPosition) {
  // increment it
  tierPosition = tierCurrentPosition + 1;

  // get all locations in this tier
  var locationsInTier = LocationsCollection.find( {tier: tierNumber} );

  // unfortunately the _id keys are strings so a normal sort doesn't work
  // instead we have to manually pull out the values
  var minLocation = 999999;
  var maxLocation = -1;

  locationsInTier.forEach(function(item) {
    var intId = parseInt(item._id);
    
    if (intId < minLocation) {
      minLocation = intId;
    }

    if (intId > maxLocation) {
      maxLocation = intId;
    }
  });

  // reset note sequence pointer when it gets to the end of the sequence
  if (tierPosition > maxLocation || tierPosition < minLocation){
    tierPosition = minLocation;
  }

  console.log('previous', tierCurrentPosition, 'new', tierPosition, 'min', minLocation, 'max', maxLocation);

  return tierPosition;
}


function sequenceTicker() {
  // add some more data to the LocationCollection, show the data on the phones
  // should show on multiple phones at once, and shouldn't turn them off immediately
  // perhaps 5 could be on at once (top tier gets tricky otherwise!)
}



