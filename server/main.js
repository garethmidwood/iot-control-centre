import { Meteor } from 'meteor/meteor';

var beatTimout;

Meteor.publish("config", function() { return ConfigCollection.find({}); });

Meteor.publish("devices", function() { return DevicesCollection.find({}); });


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
  Meteor.clearTimeout(beatTimout);
  beat(pulseRate);
}

function beat(pulseRate) {
    beatTimout = Meteor.setTimeout(function () {
        console.log('beat at ' + pulseRate);

        onBeat();

        beat(pulseRate);
    }, pulseRate);
}

function onBeat() {
  // clear collections
  Led1Collection.remove({});

  Led1Collection.insert({colour: "red"});
}
