const functions = require("firebase-functions");
const yo = require('./yo')
const searchUser = require('./searchUser')


exports.yo = functions.https.onRequest(yo.app);
exports.searchUser = functions.https.onRequest(searchUser.search);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
