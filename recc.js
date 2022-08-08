const moment = require('moment');
var admin = require('firebase-admin'); 
const express = require('express');
const match = express();
match.use(express.json());
const bodyParser= require('body-parser');
const functions = require("firebase-functions");
const { request, response } = require('express');

match.use(bodyParser.urlencoded({ extended: true }))


match.listen(8080, function() {
    console.log('listening on port 8080')
  })

admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
  

const db = admin.firestore();






match.post('/getMatches', async (req, res) => {

    //implementation of the Haversine Formula
    //deadass just copy pasted this bitch lmao
    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }
  
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {   // finds the distance between two users and returns the distance in miles
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      return d/1.609; //fuck you we're using miles
    }
  
    let mainSnapshot = await db.collection('Users').doc(req.body.uid).get()   //pulling the users data from the inputted UID
    let mainUser = mainSnapshot.data()  
  
    let users = [];
    let scores = []
  
    let snapshot = await db.collection('Users').limit(10).get()  
    
     //pulling 10 users
    snapshot.forEach(doc => users.push(doc.data()))
  
    users.forEach(user => {
      
      let scheduleScore = 0
      let ageScore = 0
      let skillScore = 0
      let genderScore = 0
      let locationScore = 0
  
      //schedule
      let numMatches = 0
      let dayOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  
      dayOfWeek.forEach(day => {
        let mainUserSchedule = Object.values(mainUser.schedule[day])
        let userSchedule = Object.values(user.schedule[day])
  
        for(let i = 0; i < 3; i++) {
          if(mainUserSchedule[i] == userSchedule[i]) {
            numMatches++
          }
        }
      })
  
      scheduleScore = (numMatches/21)*100
  
      //age
      let ageDiff = Math.floor((moment.duration(moment(mainUser.dob).diff(moment(user.dob))).asDays())/365);
  
      if(ageDiff < 4) {
        ageScore = 100
      } else if (ageDiff < 7) {
        ageScore = 65
      } else {
        ageScore = 40
      }
  
      //skill
      skillScore = ((10 - (Math.abs(mainUser.skill-user.skill)))/10)*100
  
      //gender
      if(mainUser.gender == user.gender) {
        genderScore = 100
      } else {
        genderScore = 75
      }
  
      //location
      let distance = getDistanceFromLatLonInKm(parseFloat(mainUser.location.lat), parseFloat(mainUser.location.long), parseFloat(user.location.lat), parseFloat(mainUser.location.long))
      if(distance <= 10) {
        locationScore = 100
      } else {
        locationScore = 50
      }
  
      let totalScore = (scheduleScore + skillScore + genderScore + locationScore + ageScore)/5
  
      scores.push(totalScore)
    }) //calculating the average of the scores
  
    let responseArr = []
  
    responseArr.push(scores.indexOf(Math.max(...scores)))
    scores.splice(scores.indexOf(Math.max(...scores)), 1)
  
    responseArr.push(scores.indexOf(Math.max(...scores)))
    scores.splice(scores.indexOf(Math.max(...scores)), 1)
  
    responseArr.push(scores.indexOf(Math.max(...scores)))
    scores.splice(scores.indexOf(Math.max(...scores)), 1)

let response = []

for (let i = 0; i < responseArr.length; i++) {    
let index = responseArr[i];
response.push(users[index])
}
res.send(response);
   
   
});
