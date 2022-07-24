

var admin = require('firebase-admin'); 
const express = require('express');
const match = express();
match.use(express.json());
const bodyParser= require('body-parser');
const functions = require("firebase-functions");

match.use(bodyParser.urlencoded({ extended: true }))


const db = admin.firestore();


function sendNotificaiton(notiToken, title, body) {

	const fetch = require('node-fetch');
	let todo = {
		to: notiToken,
		title: title,
		body: body
	};

	fetch('https://exp.host/--/api/v2/push/send', {
			method: 'POST',
			body: JSON.stringify(todo),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(res => res.json())
		.then(json => console.log(json));
}


async function testAuth(token) { //req.headers['authorization']
	if (token) {

		return await admin
			.auth()
			.verifyIdToken(token)
			.then(function() {
				return Promise.resolve(true)
			})
			.catch(function() {
				return Promise.resolve(false)
			})
	} else {
		return false
	}

}

match.post('/createMatch', async (req, res) => {
  if (await testAuth(req.headers['authorization'])) {
    try{
    const snapshot = await admin.firestore().collection('users').doc(req.body.uid1).get()
    let postModel = snapshot.data()
    postModel.Matches.push(req.body.data1)
    await admin.firestore().collection('users').doc(req.body.uid1).set(postModel)
   const snip = await admin.firestore().collection('users').doc(req.body.uid2).get()
    let snippet = snip.data()
    snippet.Matches.push(req.body.data2)
    await admin.firestore().collection('users').doc(req.body.uid2).set(snippet)
    sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
    res.send({status: 200})
    } catch (error) {
      res.send({error: error.message})}
  }
  else{
    res.send({info: "auth failed"})
  }
  })

  match.post('/cancelMatch', async (req, res) => {
    if (await testAuth(req.headers['authorization'])) {
      try {
    const snapshot = await admin.firestore().collection('users').doc(req.body.uid1).get()
    let postModel = snapshot.data()
    const snip = await admin.firestore().collection('users').doc(req.body.uid2).get()
    let snippet = snip.data()
    let data = postModel.Matches;      //data is the match array
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
       if(element.Ref = req.body.uid2){ //we check for the same ref in that araray the req gives
           postModel.Matches[index].status = "rejected"; // we change the match array term status to rejected
           for (let i = 0; i < snippet.Matches.length; i++) {
             if(snippet.Matches[i].Ref == req.body.uid1){
              snippet.Matches[i].status = "rejected";
              await admin.firestore().collection('users').doc(req.body.uid2).set(snippet) 
             }
           }
           await admin.firestore().collection('users').doc(req.body.uid1).set(postModel) 
           res.send({status: 200})
       }
    }
  } catch (error) {res.send(error)}
    }
     else{
      res.send({status: 400,  message: "Invalid authorization"}); 
     }
  })

  
match.post('/acceptMatch', async (req, res) => {
    if (await testAuth(req.headers['authorization'])) {
      try {
    const snapshot = await admin.firestore().collection('users').doc(req.body.uid1).get()
    let postModel = snapshot.data()
    const snip = await admin.firestore().collection('users').doc(req.body.uid2).get()
    let snippet = snip.data()
    let data = postModel.Matches;      //data is the match array
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
       if(element.Ref = req.body.uid2){ //we check for the same ref in that araray the req gives
           postModel.Matches[index].status = "accepted"; // we change the match array term status to rejected
           for (let i = 0; i < snippet.Matches.length; i++) {
             if(snippet.Matches[i].Ref == req.body.uid1){
              snippet.Matches[i].status = "accepted";
              await admin.firestore().collection('users').doc(req.body.uid2).set(snippet) 
             }
           }
           await admin.firestore().collection('users').doc(req.body.uid1).set(postModel) 
           sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
           res.send({status: "200 OK"});
       } 
    }
  } catch (error){
    res.send(error.message);
  }
  } else{
    res.send({info: "auth failed"})
  }
    
  })

  exports.match = functions.https.onRequest(match)