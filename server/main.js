import { Meteor } from 'meteor/meteor';

var beatTimeout;
var currentBeat;
var paused = true;


// var marqueeImagesTier1 = ['abstract1','abstract2','abstract3','abstract4','abstract5','abstract6'];
// var marqueeImagesTier2 = ['colour1','colour2','colour3','colour4','colour5'];
// var marqueeImagesTier3 = ['logo1','logo2'];

var marqueeImagesTier1 = ['letter-b','letter-i','letter-r','letter-t','letter-h','letter-d','letter-a','letter-y'];
var marqueeImagesTier2 = ['letter-h','letter-a','letter-p','letter-p','letter-y'];
var marqueeImagesTier3 = ['letter-4','letter-0','letter-0'];


Meteor.publish("devices", function() { return DevicesCollection.find({}); });

Meteor.publish("config", function() { return ConfigCollection.find({}); });

Meteor.publish("locations", function() { return LocationsCollection.find({}, {sort: {_id: 1} }); });








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
      console.log('this location is already taken, cannot give it to ', this.connection.id);

      return false;
    }
  },
  'pause': function() {
    paused = true;
    ConfigCollection.update({_id: 'isPaused'}, {value: paused});
  },
  'play': function() {
    paused = false;
    ConfigCollection.update({_id: 'isPaused'}, {value: paused});
    ConfigCollection.update({_id: 'sequenceReset'}, {value: false});
  },
  'reset': function() {
    paused = true;
    ConfigCollection.update({_id: 'isPaused'}, {value: paused});
    ConfigCollection.update({_id: 'sequenceReset'}, {value: true});
    ConfigCollection.update({_id: 'activePositions'}, { values: [0]});
    ConfigCollection.update({_id: 'marqueeImageOffsets'}, { values: [(marqueeImagesTier1.length * -1) - 1, (marqueeImagesTier2.length * -1) - 1, (marqueeImagesTier3.length * -1) -1] });
  },
  'disconnect': function() {
    paused = true;
    ConfigCollection.update({_id: 'isPaused'}, {value: paused});
    ConfigCollection.update({_id: 'activePositions'}, { values: [0]});
    resetLocationsCollection();
  },
  'audio-restart': function() {
    paused = true;
    ConfigCollection.update({_id: 'isPaused'}, {value: paused});
    ConfigCollection.update({_id: 'sequenceReset'}, {value: true});
  },



  'select-sequence-single': function() {
    console.log('switching to single sequence');
    paused = true;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});   
    ConfigCollection.update({_id:'selectedSequence'}, { value: 'single-regular'});
    removeStoredLocationClasses();
  },
  'select-sequence-duo': function() {
    console.log('switching to duo sequence');
    paused = true;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});   
    ConfigCollection.update({_id:'selectedSequence'}, { value: 'duo'});
    removeStoredLocationClasses();
  },
  'select-sequence-tiered': function() {
    console.log('switching to tiered sequence');
    paused = true;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});   
    ConfigCollection.update({_id:'selectedSequence'}, { value: 'tiered'});
    removeStoredLocationClasses();
  },
  'select-sequence-fulltier': function() {
    console.log('switching to full tier sequence');
    paused = true;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});   
    ConfigCollection.update({_id:'selectedSequence'}, { value: 'fulltier'});
    removeStoredLocationClasses();
  },
  'select-sequence-marquee': function() {
    console.log('switching to marquee sequence');
    paused = true;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});   
    ConfigCollection.update({_id:'selectedSequence'}, { value: 'marquee'});
    ConfigCollection.update({_id:'selectedGraphic'}, { value: 'naah'});
    removeStoredLocationClasses();
    setNewBeat(1000);
  },
  'sequence-control-all': function() {
    console.log('switching to "all" sequence');
    paused = true;
    ConfigCollection.update({_id:'isPaused'}, {value: paused});   
    ConfigCollection.update({_id:'selectedSequence'}, { value: 'all'});
    removeStoredLocationClasses();
  },



  'sequence-control-audio-on': function() {
    console.log('switching audio to on');
    ConfigCollection.update({_id:'audioVolume'}, { value: 1});
  },
  'sequence-control-audio-off': function() {
    console.log('switching audio to off');
    ConfigCollection.update({_id:'audioVolume'}, { value: 0});
  },


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
    setNewBeat(4350);
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
    currentBeat = 3390;
    beat(currentBeat); 
});


function resetDevicesCollection() {
  console.log('Resetting device collection');
  DevicesCollection.remove({});
}

function resetConfigCollection() {
  console.log('Resetting config collection');
  ConfigCollection.remove({});
  ConfigCollection.insert({_id: 'isPaused', value: true});
  ConfigCollection.insert({_id: 'sequenceReset', value: false});
  ConfigCollection.insert({_id: 'activePositions', values: [0]});
  ConfigCollection.insert({_id: 'selectedSequence', value: 'single-regular'});
  ConfigCollection.insert({_id: 'selectedGraphic', value: 'abstract1'});
  ConfigCollection.insert({_id: 'marqueeImages', values: [marqueeImagesTier1, marqueeImagesTier2, marqueeImagesTier3]});
  ConfigCollection.insert({_id: 'marqueeImageOffsets', values: [(marqueeImagesTier1.length * -1) - 1, (marqueeImagesTier2.length * -1) - 1, (marqueeImagesTier3.length * -1) -1]});
  ConfigCollection.insert({_id: 'audioVolume', value: 0});
}

function resetLocationsCollection() {
  console.log('Resetting locations collection');
  LocationsCollection.remove({});
  LocationsCollection.insert({_id: "1", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "2", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "3", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "4", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "5", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "6", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "7", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "8", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "9", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "10", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "11", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "12", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "13", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "14", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "15", tier: 1, sessionId: null, class: null});
  LocationsCollection.insert({_id: "16", tier: 2, sessionId: null, class: null});
  LocationsCollection.insert({_id: "17", tier: 2, sessionId: null, class: null});
  LocationsCollection.insert({_id: "18", tier: 2, sessionId: null, class: null});
  LocationsCollection.insert({_id: "19", tier: 2, sessionId: null, class: null});
  LocationsCollection.insert({_id: "20", tier: 2, sessionId: null, class: null});
  LocationsCollection.insert({_id: "21", tier: 2, sessionId: null, class: null});
  LocationsCollection.insert({_id: "22", tier: 2, sessionId: null, class: null});
  LocationsCollection.insert({_id: "23", tier: 2, sessionId: null, class: null});
  LocationsCollection.insert({_id: "24", tier: 2, sessionId: null, class: null});
  LocationsCollection.insert({_id: "25", tier: 2, sessionId: null, class: null});
  LocationsCollection.insert({_id: "26", tier: 2, sessionId: null, class: null});
  LocationsCollection.insert({_id: "27", tier: 2, sessionId: null, class: null});
  LocationsCollection.insert({_id: "28", tier: 3, sessionId: null, class: null});
  LocationsCollection.insert({_id: "29", tier: 3, sessionId: null, class: null});
  LocationsCollection.insert({_id: "30", tier: 3, sessionId: null, class: null});
  LocationsCollection.insert({_id: "31", tier: 3, sessionId: null, class: null});
  LocationsCollection.insert({_id: "32", tier: 3, sessionId: null, class: null});
  // LocationsCollection.insert({_id: "33", tier: 3, sessionId: null, class: null});
  // LocationsCollection.insert({_id: "34", tier: 3, sessionId: null, class: null});
  // LocationsCollection.insert({_id: "35", tier: 3, sessionId: null, class: null});
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

  currentBeat = pulseRate;

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
    case 'marquee':
      sequenceMarquee();
      break;
    case 'tiered':
      sequenceSingleRegularTiered();
      break;
    case 'fulltier':
      sequenceFullTiered();
      break;
    case 'all':
      sequenceAll();
      break;
    case 'duo':
      sequenceTwoAtATimeRegular();
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


function sequenceTwoAtATimeRegular() {
  var currentPointerValues = ConfigCollection.findOne({_id: 'activePositions'}).values;

  console.log('Running two at a time sequence, pointer values: ', currentPointerValues);

  // there should only be two items, so use the second value in the array
  if (currentPointerValues[1]) {
    currentPointer = currentPointerValues[1];
  } else {
    currentPointer = 1;
  }

  // increment it
  nextPointer = currentPointer + 1;

  // length of this sequence is the total number of locations
  var sequenceLength = LocationsCollection.find({}).count();

  // reset note sequence pointer when it gets to the end of the sequence
  if (nextPointer > sequenceLength){
    nextPointer = 1;
  }
  
  // update the active pointer
  // we only have one active pointer at a time
  ConfigCollection.update({_id: 'activePositions'}, {values: [currentPointer, nextPointer]});
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
  // var locationsInTier = LocationsCollection.find( {tier: tierNumber} );
  var locationsInTier = getLocationsByTier(tierNumber);

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


function sequenceFullTiered() {
  var currentPointerValues = ConfigCollection.findOne({_id: 'activePositions'}).values;

  console.log('Running full tier sequence, pointer values: ', currentPointerValues);

  // there should only be one tier active, so we'll get the 
  // current tier from the first value in the array
  currentPointer = currentPointerValues[0];
  var theLocation = currentPointer.toString();

  console.log('looking for pointer ', theLocation);


  // get the details of the first location so we can pull the tier number
  var currentTierFirstLocation = LocationsCollection.findOne(theLocation);
  console.log('current tier first location', currentTierFirstLocation);

  if (!currentTierFirstLocation) {
    console.log('first location is not set activating tier 1');
    // activate tier 1
    var locationsInTier = getLocationsByTier(1);
  } else if (currentTierFirstLocation.tier == 1) {
    console.log('first location is tier 1, activating tier 2');
    // activate tier 2
    var locationsInTier = getLocationsByTier(2);
  } else if (currentTierFirstLocation.tier == 2) {
    console.log('first location is tier 2, activating tier 3');
    // activate tier 3
    var locationsInTier = getLocationsByTier(3);
  } else {
    console.log('first location is tier 3, activating tier 1');
    // activate tier 1
    var locationsInTier = getLocationsByTier(1);
  }

  var newLocations = [];

  locationsInTier.forEach(function(item) {
    newLocations.push(item._id);
  });

  // update the active pointer
  // we only have one active pointer at a time
  ConfigCollection.update({_id: 'activePositions'}, {values: newLocations});
}

function getLocationsByTier(tierNumber) {
  return LocationsCollection.find({tier: tierNumber});
}


function sequenceMarquee() {
  var marqueeImageOffsets = ConfigCollection.findOne({_id: 'marqueeImageOffsets'}).values;
  var marqueeImages = ConfigCollection.findOne({_id: 'marqueeImages'}).values;

  // console.log('marquee image offsets', marqueeImageOffsets);
  // console.log('marquee images', marqueeImages);

  var tier1Pointers = scrollTierMessage(1, marqueeImageOffsets, marqueeImages);
  var tier2Pointers = scrollTierMessage(2, marqueeImageOffsets, marqueeImages);
  var tier3Pointers = scrollTierMessage(3, marqueeImageOffsets, marqueeImages);

  var allpointervalues = tier1Pointers.concat(tier2Pointers, tier3Pointers);
  // console.log('all pointer values are:', allpointervalues);

  ConfigCollection.update({_id: 'activePositions'}, {values: allpointervalues });
}

function scrollTierMessage(tierNumber, marqueeImageOffsets, marqueeImages) {

  // console.log('scrolling tier ', tierNumber, marqueeImageOffsets, marqueeImages);

  var tierIndex = tierNumber - 1;
  var currentOffset = marqueeImageOffsets[tierIndex];

  var marqueeImagesIndex = tierNumber - 1;

  // increment offset
  nextOffset = currentOffset + 1;

  // length of this sequence is the total number of locations
  var tierLocations = getLocationsByTier(tierNumber);
  var tierLength = tierLocations.count();
  // if (tierIndex == 2) { console.log(tierLength, 'items in tier', tierNumber); }

  // reset offset when it gets to the end of the sequence
  if (nextOffset > (tierLength - 1)) {
    nextOffset = 0;
  }

  // update the offset
  marqueeImageOffsets[tierIndex] = nextOffset;
  ConfigCollection.update({_id: 'marqueeImageOffsets'}, {values: marqueeImageOffsets});
  console.log('Set new offset for tier', tierNumber, 'to', nextOffset);

  // assign locations to each of the images in this tier
  var imageLocations = [];
  marqueeImages[tierIndex].forEach(function(item, index) {
    var theLocation = 1 + index + nextOffset;

    // if (tierIndex == 2) { console.log('calculated location as ', theLocation); }
    
    if (theLocation >= tierLength) {
      theLocation = theLocation - tierLength;
      // if (tierIndex == 2) { console.log('adjusted location to ', theLocation); }
    }

    imageLocations.push({location: theLocation, imageClass: item});
  });

  // turn off the previous first location
  var previousFirstLocation = LocationsCollection.findOne(currentOffset);

  if (previousFirstLocation) {
    LocationsCollection.update(previousFirstLocation, { $set: { class: null } } );
  }

  // zero index the locations on this tier, so that the marquee indexes match up
  var tierLocationsZeroIndexed = [];

  tierLocations.forEach(function(item) {
    tierLocationsZeroIndexed.push(item._id);
  });

  // make sure it's sorted by the _id values
  tierLocationsZeroIndexed.sort(sortNumber);

  // we'll store the 'active' locations in this array
  var newLocations = [];

  // set the classes for the current, active locations
  imageLocations.forEach(function(item) {
    // console.log('now update item in location', item.location, 'to have a class of', item.imageClass);
    // console.log('looking for location', item.location, 'on tier', tierNumber);

    if (!tierLocationsZeroIndexed[item.location]) {
      return;
    }

    var locationString = tierLocationsZeroIndexed[item.location];

    var itemLocation = LocationsCollection.findOne(locationString);

    if (itemLocation) {
      LocationsCollection.update(itemLocation, { $set: { class: item.imageClass } } );
      console.log('turning on marquee for location ', locationString);
      newLocations.push(locationString);
    }
  });

  return newLocations;
}

function sortNumber(a, b) {
  return a - b;
}

function removeStoredLocationClasses() {
  console.log('removing stored location classes');
  LocationsCollection.update({}, { $set: {class: null} }, { multi: true });
}

