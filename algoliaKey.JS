const algoliasearch = require('algoliasearch');

const client = algoliasearch('***', 'ballgridSearch');
 client.initIndex('searchUser');

const publicKey = client.generateSecuredApiKey(
  'yo',
  {
    
  }
);

console.log(publicKey);
