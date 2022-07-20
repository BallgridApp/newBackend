const algoliasearch = require('algoliasearch');

const client = algoliasearch('3IL7N429NT', '5f17a8472318554afa274ab4f70cb592');
const index = client.initIndex('searchUser');

const express = require('express');
const search = express();
search.use(express.json());

var admin = require('firebase-admin');

const functions = require("firebase-functions");

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


search.post('/searchUser', async function(req, res){
  if (await testAuth(req.headers['authorization'])){
    try{
index.search(req.body.searchQuerry).then(({ hits }) => {
    res.send(hits);
  });
  }
  catch (error){
    res.send({status:400});
  }
}
  else{
    res.send({status: 400, info: "auth error"});
  }
})

exports.search = functions.https.onRequest(search);