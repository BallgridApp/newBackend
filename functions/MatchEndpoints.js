

var admin = require('firebase-admin'); 
const express = require('express');
const match = express();
match.use(express.json());
const bodyParser= require('body-parser');
const functions = require("firebase-functions");
const { request } = require('express');

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

match.post('/createMatch', async (req, res) => { // "uid1" : "first user uid", "uid2" : "second user uid",  "ExponentPushToken[tjJyGyGcg6kUw5G8nkACzt]", "title" : "new match ", "body" : "open app to see"
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
      res.send({status : 400, info: "check the request body"})}
  }
  else{
    res.send({status : 400, info: "auth failed"})
  }
  })

  match.post('/cancelMatch', async (req, res) => { // "uid1" : "first user uid", "uid2" : "second user uid", "
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
  } catch (error) {res.send({status: 400, info: "check the request body"})}
    }
     else{
      res.send({status: 400,  message: "Invalid authorization"}); 
     }
  })

  
match.post('/acceptMatch', async (req, res) => { //"uid1" : "first user uid", "uid2" : "second user uid",  "ExponentPushToken[tjJyGyGcg6kUw5G8nkACzt]", "title" : "someone accepted your match" , "body" : "open app to see"
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
    res.send({status : 400, info: "check the request body"});
  }
  } else{
    res.send({status : 400, info: "auth failed"})
  }
    
  })

  
match.post('/getPosts', async (req, res) => {
  if (await testAuth(req.headers['authorization'])) {
  try{
  const PostsCollection = db.collection('Posts');
  const posts = await PostsCollection.orderBy('time').limit(50).get();
  let response = [];
  posts.forEach(doc => {
    response.push(doc.data());
  });
  res.send(response);
}
catch (err) {res.send({status:400, info : "code error"})}
  }
else{
  res.send({status:400, info : "auth failed"})
}
  })


match.post('/createChat', async (req, res) => {
  if (await testAuth(req.headers['authorization'])) {
    try{
    await admin.firestore().collection('chats').add(req.body) 
    } catch (error) {res.send({status : 400, info : "check request body"})}
     }
     else{
      res.send({status:400, info : "auth failed"})
     }   // refs of the two users creating the chat
  }) 


match.post('/sendMessage', async (req, res) => {
  if (await testAuth(req.headers['authorization'])) {
    try{
   await admin.firestore().collection('chats').doc(req.body.uid).collection('messages').add(req.body)
    } catch (error) {res.send({status : 400, info: "check the request body"})}
   }
   else{
    request.send({status : 400, info : "auth failed"})
   } // refs of the two users creating the chat
  }) 
  
  
match.post('/updateTimestamp', async (req, res) => {
  if (await testAuth(req.headers['authorization'])) {
    try{
    let timeMarker = Timestamp.fromDate(new Date(req.body.date))      //Date format should be like this and this only: 'October 24, 2004'
    await db.collection('chats').doc(req.body.uid).collection('messages').doc(req.body.uid).update({time : timeMarker})
    } catch (error) {res.send({status : 400, info: "check the request body"})} 
    }
    else{
      res.send({status: 400, info : "auth failed"})
    }  //Make sure to plug in the UID of the MESSAGE document
   }) 
  
  
match.post('/editMessage', async (req, res) => {
  if (await testAuth(req.headers['authorization'])) {
    try{
    await db.collection('chats').doc(req.body.uid).collection('messages').doc(req.body.uid).update({message : req.body.message}) 
    } catch (error) {res.send({status : 400, info: "check the request body"}) }
   }
   else{
    res.send({status: 400, info : "auth failed"})
   } //Make sure to plug in the UID of the MESSAGE document
   }) 
  
  
match.post('/getMessages', async (req, res) => {
  if (await testAuth(req.headers['authorization'])) {
    try{
    const messageCollection = db.collection('chats').doc(req.body.uid).collection('messages'); // uid of the chat room document, not the message docs
    const messages = await messageCollection.orderBy('time').limit(50).get();
    let response = [];
    messages.forEach(doc => {
      response.push(doc.data());
    });
    res.send(response);
    }
    catch (error){res.send({status : 400, info: "check the request body"})}
  }
  else{
    res.send({status : 400, info : "auth failed"})
  }
  }) 

  


  exports.match = functions.https.onRequest(match)