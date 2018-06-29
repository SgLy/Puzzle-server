import * as crypto from 'crypto';
const sha256 = (s: string) =>
  crypto.createHash('sha256').update(s).digest('hex');
import { MongoClient, Db } from 'mongodb';

async function createUser(db: Db) {
  console.log('Creating user');
  await db.createCollection('user', {
    validationLevel: 'strict',
    validationAction: 'error',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            bsonType: 'string',
            pattern: '[A-Za-z0-9-_]{3,20}'
          },
          password: {
            bsonType: 'string',
            pattern: '^[a-f0-9]{64}$'
          },
          nickname: {
            bsonType: ['string', 'null']
          },
          token: {
            bsonType: ['string', 'null'],
            pattern: '^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$'
          }
        }
      }
    }
  });
  await db.collection('user')
    .createIndex({ username: 1 }, { unique: true });
  await db.collection('user')
    .createIndex({ token: 2 }, { unique: true, sparse: true });
  console.log('Insert default user');
  await db.collection('user').insertOne({
    username: 'test',
    password: sha256('test'),
    nickname: 'Just a test'
  });
}

async function createResult(db: Db) {
  console.log('Creating result');
  await db.createCollection('result', {
    validationLevel: 'strict',
    validationAction: 'error',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['username', 'pattern', 'time', 'timestamp'],
        properties: {
          username: {
            bsonType: 'string',
            pattern: '[A-Za-z0-9-_]{3,20}'
          },
          pattern: { bsonType: 'int' },
          time: { bsonType: 'int' },
          timestamp: { bsonType: 'date' }
        }
      }
    }
  });
}

(async () => {
  const dbName = 'puzzle';
  const url = 'mongodb://localhost:27017';
  try {
    let client = await MongoClient.connect(url); 
    let db = client.db(dbName);
    console.log('Connected to MongoDB');
    
    console.log('Droping existing');
    await db.dropDatabase();
    
    await Promise.all([
      createUser(db),
      createResult(db)
    ]);
    
    await client.close();
  } catch (err) {
    console.log(err.stack);
  };
})().then(() => {
  console.log('Done');
});