

var admin = require('firebase-admin'); 
const express = require('express');
const app = express();
app.use(express.json());
const bodyParser= require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))

app.listen(8080, function() {
  console.log('listening on port 8080')
})

 admin.initializeApp({
  credential: admin.credential.applicationDefault()
});



const db = admin.firestore();


app.post('/createMatch', async (req, res) => {
    
    const snapshot = await admin.firestore().collection('users').doc(req.body.uid1).get()
    let postModel = snapshot.data()
    postModel.Matches.push(req.body.data1)
    await admin.firestore().collection('users').doc(req.body.uid1).set(postModel)
   const snip = await admin.firestore().collection('users').doc(req.body.uid2).get()
    let snippet = snip.data()
    snippet.Matches.push(req.body.data2)
    await admin.firestore().collection('users').doc(req.body.uid2).set(snippet)
    //sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
    res.send({info: "never is enough"})
  })

  app.post('/cancelMatch', async (req, res) => {
    
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
           res.send("lets fucking go")
       }
    }
    
    
  })

  
  app.post('/acceptMatch', async (req, res) => {
    
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
           res.send("lets fucking go")
       }
    }
    
    
  })