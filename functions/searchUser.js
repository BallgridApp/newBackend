const algoliasearch = require('algoliasearch');

const client = algoliasearch('sdfasd,asdfasdf');
const index = client.initIndex('searchUser');

const express = require('express');
const search = express();
search.use(express.json());
const { app } = require('firebase-admin');
var admin = require('firebase-admin'); 
const { error } = require('firebase-functions/logger');


admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });


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

search.post('/searchUser', async function(req, res){
if(await testAuth(req.headers['authorization'])){
    try{
index.search(req.body.searchQuerry).then(({ hits }) => {
    res.send(hits);
  });

}
catch (error){
    res.send({status:400})
}
}
else{
   console.log(error);
}

})


