const redis = require('redis');
const express = require('express');
const badgeRequests = require('./badgeRequests');

const redisClient = redis.createClient({ db: 2 });
const app = express();

//log request url and method
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/status/:username', (req, res) => {
  badgeRequests.get(redisClient, req.params.username).then(badge => {
    res.write(JSON.stringify(badge));
    res.end();
  });
});

const isUserAlreadyExists = username => {
  return new Promise((resolve, reject) => {
    badgeRequests.get(redisClient, username).then(userData => {
      if (userData) resolve(username);
      else reject('no user found');
    });
  });
};

app.post('/:username', (req, res) => {
  isUserAlreadyExists(req.params.username)
    .then(username => {
      res.send(username);
      res.end();
    })
    .catch(() => {
      badgeRequests
        .addBadgeRequest(redisClient, req.params.username)
        .then(jobToSchedule => {
          redisClient.lpush('ipQueue', jobToSchedule.username, () => {
            res.send(jobToSchedule.username);
            res.end();
          });
        });
    });
});

app.listen(8000, () => console.log('listening on 8000...'));
