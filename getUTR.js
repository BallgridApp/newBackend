


function sendNotificaiton(notiToken, title, body) {

	const fetch = require('node-fetch');
	fetch('https://agw-prod.myutr.com/api/v2/search/players?query={RahulRavi}&top={5}', {
			
		}).then(res => res.json())
		.then(json => console.log(json));
}
sendNotificaiton()