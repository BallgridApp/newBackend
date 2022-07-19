var admin = require('firebase-admin');
const express = require('express');
const app = express();
app.use(express.json());
const bodyParser = require('body-parser')
const functions = require("firebase-functions");
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


app.post('/updateUser', async (req, res) => {

	authStatus = await testAuth(req.headers['authorization']);

	if (authStatus) {
		try {
			await admin.firestore().collection('Users').doc(req.body.uid).set(req.body)
			res.send({
				info: 'User Updated'
			})
		} catch (error) {
			res.send({
				status: 400
			});
		}
	} else {
		res.send({
			status: 400
		});
	}
})

app.post('/getUser', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Users').doc(req.body.uid).get()
			res.send(snapshot.data())
		} catch (error) {
			res.send({
				status: 400
			});
		}
	} else {
		res.send({
			status: 400
		});
	}
})


app.post('/deleteUser', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			await admin.firestore().collection('Users').doc(req.body.uid).delete()
			res.send({
				info: 'User Deleted'
			})
		} catch (error) {
			res.send({
				status: 400
			});
		}
	} else {
		res.send({
			status: 400
		});
	}
})

app.post('/createUser', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			await admin.firestore().collection('Users').doc(req.body.uid).set(req.body)
			res.send({
				info: 'User Created'
			})
		} catch (error) {
			res.send({
				status: 400
			});
		}
	} else {
		res.send({
			status: 400
		});
	}
})

app.post('/updatePost', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			await admin.firestore().collection('Posts').doc(req.body.uid).set(req.body)
			res.send({
				info: 'User Updated'
			})
		} catch (error) {
			res.send({
				status: 400
			});
		}
	} else {
		res.send({
			status: 400
		});
	}

})

app.post('/getPost', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			res.send(snapshot.data())
		} catch (error) {
			res.send({
				status: 400
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/deletePost', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			await admin.firestore().collection('Posts').doc(req.body.uid).delete()
			res.send({
				info: 'Post Deleted'
			})
		} catch (error) {
			res.send({
				status: 400
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/createPost', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			await admin.firestore().collection('Posts').doc(req.body.uid).set(req.body)
			res.send({
				info: 'Post Created'
			})
		} catch (error) {
			res.send({
				status: 400
			});
		}

	} else {
		res.send({
			status: 400,
			info: "auth failed"
		})
	}
})

app.post('/addLike', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.Likes += 1
			await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
			sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
			res.send({
				info: "never is enough"
			})
		} catch (error) {
			res.send({
				status: 400
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
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.Likes + -1
			await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
			res.send({
				info: "coding is for special children"
			})
		} catch (error) {
			res.send({
				status: 400
			});

		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/addComment', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.comments.push(req.body.comment)
			await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
			sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
			res.send({
				info: "never is enough"
			})
		} catch (error) {
			res.send({
				status: 400
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
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.comments.splice(postModel.comments.indexOf(req.body.comment))
			await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
			res.send({
				info: "never is enough"
			})
		} catch (error) {
			res.send({
				status: 400
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/addFriendRequest', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.friendRequests.push(req.body.reqUid)
			await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
			sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
			res.send({
				info: "never is enough"
			})
		} catch (error) {
			res.send({
				status: 400
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
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.friendRequests.splice(postModel.friendRequests.indexOf(req.body.reqUid))
			await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
			res.send({
				info: "never is enough"
			})
		} catch (error) {
			res.send({
				status: 400
			})
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/getFriendRequests', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			res.send(snapshot.data().friendRequests)
		} catch (error) {
			res.send({
				status: 400
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/addFriend', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.friends.push(req.body.reqUid)
			await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
			sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
			res.send({
				info: "never is enough"
			})
		} catch (error) {
			res.send({
				status: 400
			});
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/removeFriend', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.friends.splice(postModel.friends.indexOf(req.body.reqUid))
			await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
			res.send({
				info: "never is enough"
			})
		} catch (error) {
			res.send({
				status: 400
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
	if (await testAuth(req.headers['authorization'])) {
		try {
			const shot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let model = shot.data()
			model.friends.push(req.body.reqUid)
			await admin.firestore().collection('Posts').doc(req.body.uid).set(model)

			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			let postModel = snapshot.data()
			postModel.friendRequests.splice(postModel.friendRequests.indexOf(req.body.reqUid))
			await admin.firestore().collection('Posts').doc(req.body.uid).set(postModel)
			sendNotificaiton(req.body.notiToken, req.body.title, req.body.body);
			res.send({
				info: "never is enough"
			})
		} catch (error) {
			res.send({
				status: 400
			})
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})

app.post('/getFriends', async (req, res) => {
	if (await testAuth(req.headers['authorization'])) {
		try {
			const snapshot = await admin.firestore().collection('Posts').doc(req.body.uid).get()
			res.send(snapshot.data().friends)
		} catch (error) {
			res.send({
				status: 400
			})
		}
	} else {
		res.send({
			status: 400,
			info: "auth failed"
		});
	}
})     
exports.app = functions.https.onRequest(app)