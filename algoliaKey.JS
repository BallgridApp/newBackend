const algoliasearch = require('algoliasearch');

const client = algoliasearch('3IL7N429NT', 'ballgridSearch');
 client.initIndex('searchUser');

const publicKey = client.generateSecuredApiKey(
  'yo',
  {
    
  }
);

console.log(publicKey);