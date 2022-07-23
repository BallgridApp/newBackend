
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
    postModel.matches.push(req.body.uid2)
    await admin.firestore().collection('users').doc(req.body.uid1).set(postModel)
    const snip = await admin.firestore().collection('users').doc(req.body.uid2).get()
    let snippet = snip.data()
    snippet.matches.push(req.body.uid1)
    await admin.firestore().collection('users').doc(req.body.uid2).set(snippet)
    //sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
    res.send({info: "never is enough"})
  })