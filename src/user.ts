import * as express from 'express';
import { MongoClient, Db } from 'mongodb';
import * as uuid from 'uuid/v1';
import * as multer from 'multer';
const SORT_ASCENDING = 1, SORT_DESCENDING = -1;

export function userApis(app: express.Express, db: Db): void {

  const loginRequired = async (
    req: express.Request, res: express.Response, next: express.NextFunction
  ) => {
    if (req.body.data.token === undefined)
      res.status(403).end();
    else {
      req.body.user = await db.collection('user')
        .findOne({ token: req.body.data.token });
      next();
    }
  };

  app.get('/api/user', loginRequired, (req, res) => {
    res.send(req.body.user);
  });
  
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body.data;
    const user = await db.collection('user').findOne({
      username, password
    });
    if (user === null) {
      res.json({ status: -1 });
      return;
    }
    user.token = uuid();
    try {
      await db.collection('user').findOneAndUpdate({ _id: user._id }, user);
      res.json({ status: 1, token: user.token });
    } catch (err) {
      console.log(err.errmsg);
      res.json({ status: -1 });
    }
  });
  
  app.post('/api/register', async (req, res) => {
    try {
      const { username, password, nickname } = req.body.data;
      const r = await db.collection('user').insertOne({
        username, password, nickname
      });
      res.json({ status: r.result.ok });
    } catch (err) {
      console.log(err.errmsg);
      res.json({ status: -1 });
    }
  });
  
  app.post('/api/result', async (req, res) => {
    try {
      let { pattern, time, timestamp } = req.body.data;
      timestamp = parseInt(timestamp);
      if (timestamp < 1e12)
      timestamp *= 1e3;
      const r = await db.collection('result').insertOne({
        pattern, time,
        timestamp: new Date(timestamp),
        username: req.body.user.username
      });
      res.json({ status: r.result.ok });
    } catch (err) {
      console.log(err.errmsg);
      res.json({ status: -1 });
    }
  });
  
  app.get('/api/rank/:pattern/:split', async (req, res) => {
    try {;
      const result : {
        time: number,
        username: string,
        timestamp: number,
        nickname: string
      }[] = [];
      const rec = await db.collection('result').aggregate([{
        $lookup: {
          from: 'user',
          localField: 'username',
          foreignField: 'username',
          as: 'user'
        }
      }, {
        $match: {
          pattern: parseInt(req.params.pattern),
          split: parseInt(req.params.split)
        }
      }]).sort({ time: SORT_ASCENDING }).limit(10);
      rec.each((err, r) => {
        if (err) throw (err);
        if (r === null) {
          res.json({
            status: 1,
            rank: result
          });
          return;
        }
        result.push({
          time: r.time,
          username: r.username,
          timestamp: r.timestamp,
          nickname: r.user[0].nickname
        });
      });
    } catch (err) {
      console.log(err.errmsg);
      res.json({ status: -1 });
    }
  });

  const upload = multer({
    storage: multer.diskStorage(({
      destination: function (req, file, cb) {
        cb(null, 'static/images');
      },
      filename: function (req: express.Request, file, cb) {
        cb(null, `${req.body.user.id}`);
      }
    }))
  });
  app.post('/api/image', upload.single('image'), (req, res) => {
    res.json({ status: 1 });
  });
}