import { Meteor } from 'meteor/meteor';

Meteor.publish("options", function() {
    return OptionsCollection.find({});
});

//Meteor.startup(() => {
//  // code to run on server at startup
//    console.log('starting..');
//});
