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

app.get('/status/:id', (req, res) => {
  badgeRequests.get(redisClient, req.params.id).then(badge => {
    res.write(JSON.stringify(badge));
    res.end();
  });
});

app.post('/:username', (req, res) => {
  badgeRequests
    .addBadgeRequest(redisClient, req.params.username)
    .then(jobToSchedule => {
      redisClient.lpush('ipQueue', jobToSchedule.id, () => {
        res.send(`id:${jobToSchedule.id}`);
        res.end();
      });
    });
});

app.listen(8000, () => console.log('listening on 8000...'));
