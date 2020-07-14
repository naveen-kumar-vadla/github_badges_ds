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

app.post('/:username', (req, res) => {
  badgeRequests.get(redisClient, req.params.username).then(userData => {
    if (userData) {
      res.send(userData.username);
      res.end();
    } else {
      badgeRequests
        .addBadgeRequest(redisClient, req.params.username)
        .then(jobToSchedule => {
          redisClient.lpush('ipQueue', jobToSchedule.username, () => {
            res.send(jobToSchedule.username);
            res.end();
          });
        });
    }
  });
});

app.listen(8000, () => console.log('listening on 8000...'));
