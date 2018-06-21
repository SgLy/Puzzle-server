const crypto = require('crypto');
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
(async () => {
  const mongo = require('mongodb').MongoClient;
  let db;
  const dbName = 'puzzle';
  const url = 'mongodb://localhost:27017';
  try {
    let client = await mongo.connect(url);
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    console.log('Creating user');
    db.createCollection('user', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              bsonType: 'string',
              pattern: 'A-Za-z0-9-_{3-20}'
            },
            password: {
              bsonType: 'string',
              pattern: '^A-F0-9]{64}$'
            },
            nickname: {
              bsonType: 'string'
            }
          }
        }
      }
    });
    console.log('Insert default user');
    db.collection('user').insertOne({
      username: 'test',
      password: sha256('test'),
      nickname: 'Just a test'
    });
    client.close();
  } catch (err) {
    console.log(err.stack);
  };
})().then(() => {
  console.log('Done');
});