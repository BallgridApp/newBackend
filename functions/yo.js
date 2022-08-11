var admin = require('firebase-admin');
const express = require('express');
const app = express();
app.use(express.json());
const bodyParser = require('body-parser')
const functions = require("firebase-functions");
const algoliasearch = require('algoliasearch');
const client = algoliasearch('3IL7N429NT', '5f17a8472318554afa274ab4f70cb592');
const index = client.initIndex('searchUser');
app.use(bodyParser.urlencoded({
	extended: true
}))



admin.initializeApp({
	credential: admin.credential.applicationDefault()
});



const db = admin.firestore();

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


app.post('/updateUser', async (req, res) => { // uid : "a;sdlkfjasdfasdf" , bio: "ye", then the rest of the body of the user. check firestore for a potential mode as it is not finalized yet

	authStatus = await testAuth(req.headers['authorization']);

	if (authStatus) {
		try {
			await admin.firestore().collection('users').doc(req.body.uid).set(req.body)
			res.send({
				info: 'User Updated'
			})
		} catch (error) {
			res.send({
				status: 400,
				info: "check the request body"
			});
		}
	} else {
		res.send({
			status: 400,
			info : "auth failed"
		});
	}
})

app.post('/getUser', async (req, res) => {   //uid : "asdfasdfasdf"
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('users').doc(req.body.uid).get()
			res.send(snapshot.data())
		} catch (error) {
			res.send({
				status: 400,
				info:"check the request body"
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})


app.post('/deleteUser', async (req, res) => {  //uid : "asdfasdfasdf"
	if (await testAuth(req.headers['authorization'])) {
		try {
			await admin.firestore().collection('users').doc(req.body.uid).delete()
			res.send({
				info: 'User Deleted'
			})
		} catch (error) {
			res.send({
				status: 400,
				info: "check the request body"
			});
		}
	} else {
		res.send({
			status: 400,
			info : "auth failed"
		});
	}
})

app.post('/createUser', async (req, res) => {  // uid : "asdf", then the body of the user being created. bio, fire and last name, etc
	if (await testAuth(req.headers['authorization'])) {
		try {
			await admin.firestore().collection('users').add(req.body)
			res.send({
				info: 'User Created'
			})
		} catch (error) {
			res.send({
				status: 400, 
				info:"check the request body"
			});
		}
	} else {
		res.send({
			status: 400, 
			info: "auth failed"
		});
	}
})

app.post('/updatePost', async (req, res) => { // uid : "asdfasdfasdf", then teh body of the updated user. 
	if (await testAuth(req.headers['authorization'])) {
		try {
			await admin.firestore().collection('Posts').doc(req.body.uid).set(req.body)
			res.send({
				info: 'User Updated'
			})
		} catch (error) {
			res.send({
				status: 400,
				info :"check the request body"
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}

})

app.post('/getPost', async (req, res) => { // uid : "asdfasdfasdf"
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			res.send(snapshot.data())
		} catch (error) {
			res.send({
				status: 400,
				info: "check the request body"
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/deletePost', async (req, res) => { // uid: "asdfasdfasdf"
	if (await testAuth(req.headers['authorization'])) {
		try {
			await admin.firestore().collection('Posts').doc(req.body.uid).delete()
			res.send({
				info: 'Post Deleted'
			})
		} catch (error) {
			res.send({
				status: 400,
				info: "check the request body"
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/createPost', async (req, res) => { // uid: "asdfasdfasdf" , title : "a kage was born", comments : [], likes : 0
	if (await testAuth(req.headers['authorization'])) {
		try {
			await admin.firestore().collection('Posts').add(req.body)
			res.send({
				info: 'Post Created'
			})
		} catch (error) {
			res.send({
				status: 400,
				info : "check the request body"
			});
		}

	} else {
		res.send({
			status: 400,
			info: "auth failed"
		})
	}
})

app.post('/updateTimestampPost', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
	  try{
	  let timeMarker = Timestamp.fromDate(new Date(req.body.date))      //Date format should be like this and this only: 'October 24, 2004'
	  await db.collection('chats').doc(req.body.uid).collection('Posts').doc(req.body.uid).update({time : timeMarker})
	  } catch (error) {res.send({status : 400, info: "check the request body"})} 
	  }
	  else{
		res.send({status: 400, info : "auth failed"})
	  }  //Make sure to plug in the UID of the MESSAGE document
	 }) 

app.post('/addLike', async (req, res) => { // uid : "asdfasdfasdf", "notiToken" , "ExponentPushToken[tjJyGyGcg6kUw5G8nkACzt]", title: "post", "body" : "someone has liked your post"
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.Likes += 1
			await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
			sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
			res.send({
				status: 200
			})
		} catch (error) {
			res.send({
				status: 400,
				info :"check the request body"
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/unlikePost', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) { // uid : "asdfasdfasdf"
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.Likes + -1
			await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
			res.send({
				status : 200
			})
		} catch (error) {
			res.send({
				status: 400,
				info : "check the request body"
			});

		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/addComment', async (req, res) => { // "comment" : "tres is a beast" , "notiToken": "ExponentPushToken[tjJyGyGcg6kUw5G8nkACzt]", "title" : "new comment" , "kage has commented on your post"
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.comments.push(req.body.comment)
			await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
			sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
			res.send({
				status : 200
			})
		} catch (error) {
			res.send({
				status: 400,
				info : "check the request body"
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		})
	}
})

app.post('/removeComment', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) { // uid : "asdfasdfasdf", comment : "kage has autism"
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.comments.splice(postModel.comments.indexOf(req.body.comment))
			await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
			res.send({
				status : 200
			})
		} catch (error) {
			res.send({
				status: 400 , 
				info : "check the request body"
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/addFriendRequest', async (req, res) => {  // uid : "uid of the person receiving the friendRequest", "reqUid" : "uid of the person sending the friendRequest", "notiToken": "ExponentPushToken[tjJyGyGcg6kUw5G8nkACzt]", "title" : "new friend Request", "body" : "open the app bitch"
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.friendRequests.push(req.body.reqUid)
			await admin.firestore().collection('users').doc(req.body.uid).set(postModel)
			sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
			res.send({
				status : 200
			})
		} catch (error) {
			res.send({
				status: 400,
				info: "check the request body"
			})
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/declineFriendRequest', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {// uid : "uid of the person declining the friend request", "reqUid" : "uid of the person getting rejected lollll"
		try {
			const snapshot = await admin.firestore().collection('users').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.friendRequests.splice(postModel.friendRequests.indexOf(req.body.reqUid))
			await admin.firestore().collection('users').doc(req.body.uid).set(postModel)
			res.send({
				status : 200
			})
		} catch (error) {
			res.send({
				status: 400 , 
				info : "check the request body"
			})
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/getFriendRequests', async (req, res) => {  // uid : "asdfasdfasdf"
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('users').doc(req.body.uid).get()
			res.send(snapshot.data().friendRequests)
		} catch (error) {
			res.send({
				status: 400,
				info: "check the request body"
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/addFriend', async (req, res) => {  // uid : "asdfasdfasdf", notiToken": "ExponentPushToken[tjJyGyGcg6kUw5G8nkACzt]", "title" : "new friend ", "body" : "open app to see new friend"
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('users').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.friends.push(req.body.reqUid)
			await admin.firestore().collection('users').doc(req.body.uid).set(postModel)
			sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
			res.send({
				status: 200
			})
		} catch (error) {
			res.send({
				status: 400,
				info : "check the request body"
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/removeFriend', async (req, res) => { // "uid" : "uid of person removing friends" , "reqUid" : "uid of person getting removed"
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('users').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.friends.splice(postModel.friends.indexOf(req.body.reqUid))
			await admin.firestore().collection('users').doc(req.body.uid).set(postModel)
			res.send({
				status: 200
			})
		} catch (error) {
			res.send({
				status: 400,
				info : "check the request body"
			})
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/acceptFriendRequest', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {  // "uid" : "uid of person accepting friend request" , reqUid :"person whos friend request who is getting accepted", "ExponentPushToken[tjJyGyGcg6kUw5G8nkACzt]", "title" : "new friend ", "body" : "open app to see new friend"
		try {
			const shot = await admin.firestore().collection('users').doc(req.body.uid).get()
			let model = shot.data()
			model.friends.push(req.body.reqUid)
			await admin.firestore().collection('users').doc(req.body.uid).set(model)

			const snapshot = await admin.firestore().collection('users').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.friendRequests.splice(postModel.friendRequests.indexOf(req.body.reqUid))
			await admin.firestore().collection('users').doc(req.body.uid).set(postModel)
			sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
			res.send({
				status : 200
			})
		} catch (error) {
			res.send({
				status: 400,
				info : "check the request body"
			})
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/getFriends', async (req, res) => {  // "uid" : "sdf"
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('users').doc(req.body.uid).get()
			res.send(snapshot.data().friends)
		} catch (error) {
			res.send({
				status: 400,
				info : "check the request body"
			})
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
}) 

app.post('/searchUser', async function(req, res){ // "searchQuerry" : "Rahul Ravi"
	if (await testAuth(req.headers['authorization'])){
	  try{
  index.search(req.body.searchQuerry).then(({ hits }) => {
	  res.send(hits);
	});
	}
	catch (error){
	  res.send({status:400, info: "check the request body"});
	}
  }
	else{
	  res.send({status: 400, info : "auth failed"});
	}
  })
exports.app = functions.https.onRequest(app)