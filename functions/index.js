const functions = require("firebase-functions");
const yo = require('./yo')
const match = require('./MatchEndpoints');


exports.yo = yo.app;
exports.match = match.match
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
