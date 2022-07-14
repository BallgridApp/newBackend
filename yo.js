
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

async function testAuth(token)
{ //req.headers['authorization']
	if (token)
	{

		return await admin
			.auth()
			.verifyIdToken(token)
			.then(function()
			{
				return Promise.resolve(true)
			})
			.catch(function()
			{
				return Promise.resolve(false)
			})
	}
	else
	{
		return false
	}

}

function sendNotificaiton(notiToken, title, body){

	const fetch = require('node-fetch');
	let todo = {
		to: notiToken,
		title: title,
		body: body
	};
	
	fetch('https://exp.host/--/api/v2/push/send', {
		method: 'POST',
		body: JSON.stringify(todo),
		headers: { 'Content-Type': 'application/json' }
	}).then(res => res.json())
	  .then(json => console.log(json));
}


app.post('/updateUser', async (req, res) => {
  await admin.firestore().collection('Users').doc(req.body.uid).set(req.body)
  res.send({info: 'User Updated'})
})

app.post('/getUser', async (req, res) => {
  const snapshot = await admin.firestore().collection('Users').doc(req.body.uid).get()
  res.send(snapshot.data())
})


app.post('/deleteUser', async (req, res) => {
  await admin.firestore().collection('Users').doc(req.body.uid).delete()
  res.send({info: 'User Deleted'})
})

app.post('/createUser', async (req, res) => {
  await admin.firestore().collection('Users').doc(req.body.uid).set(req.body)
  res.send({info: 'User Created'})
})

app.post('/updatePost', async (req, res) => {
  await admin.firestore().collection('Posts').doc(req.body.uid).set(req.body)
  res.send({info: 'User Updated'})
})

app.post('/getPost', async (req, res) => {
  const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
  res.send(snapshot.data())
})

app.post('/deletePost', async (req, res) => {
  await admin.firestore().collection('Posts').doc(req.body.uid).delete()
  res.send({info: 'Post Deleted'})
})

app.post('/createPost', async (req, res) => {
  await admin.firestore().collection('Posts').doc(req.body.uid).set(req.body)
  res.send({info: 'Post Created'})
})

app.post('/addLike', async (req, res) => {
  const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
  let postModel = snapshot.data()
  postModel.Likes += 1
  await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
  sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
  res.send({info: "never is enough"})
})

app.post('/unlikePost', async (req, res) => {
  const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
  let postModel = snapshot.data()
  postModel.Likes +- 1
  await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
  res.send({info: "never is enough"})
})

app.post('/addComment', async (req, res) => {
  const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
  let postModel = snapshot.data()
  postModel.comments.push(req.body.comment)
  await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
  sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
  res.send({info: "never is enough"})
})

app.post('/removeComment', async (req, res) => {
  const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
  let postModel = snapshot.data()
  postModel.comments.splice(postModel.comments.indexOf(req.body.comment))
  await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
  res.send({info: "never is enough"})
})

app.post('/addFriendRequest', async (req, res) => {
  const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
  let postModel = snapshot.data()
  postModel.friendRequests.push(req.body.reqUid)
  await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
  sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
  res.send({info: "never is enough"})
})

app.post('/declineFriendRequest', async (req, res) => {
  const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
  let postModel = snapshot.data()
  postModel.friendRequests.splice(postModel.friendRequests.indexOf(req.body.reqUid))
  await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
  res.send({info: "never is enough"})
})

app.post('/getFriendRequests', async (req, res) => {
  const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
  res.send(snapshot.data().friendRequests)
})

app.post('/addFriend', async (req, res) => {
  const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
  let postModel = snapshot.data()
  postModel.friends.push(req.body.reqUid)
  await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
  sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
  res.send({info: "never is enough"})
})

app.post('/removeFriend', async (req, res) => {
  const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
  let postModel = snapshot.data()
  postModel.friends.splice(postModel.friends.indexOf(req.body.reqUid))
  await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
  res.send({info: "never is enough"})
})

app.post('/acceptFriendRequest', async (req, res) => {
  const shot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
  let model = shot.data()
  model.friends.push(req.body.reqUid)
  await admin.firestore().collection('Posts').doc(req.body.uid).set(model)

  const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
  let postModel = snapshot.data()
  postModel.friendRequests.splice(postModel.friendRequests.indexOf(req.body.reqUid))
  await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
  sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
  res.send({info: "never is enough"})
})

app.post('/getFriends', async (req, res) => {
  const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
  res.send(snapshot.data().friends)
})             