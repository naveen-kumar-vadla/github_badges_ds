const redis = require('redis');
const express = require('express');
const badgeRequests = require('./badgeRequests');

const redisClient = redis.createClient({ db: 2 });
const app = express();
const jobs = [];

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

app.get('/request-job', (req, res) => {
  let job = {};
  if (jobs.length) job = jobs.shift();
  res.write(JSON.stringify(job));
  res.end();
});

app.post('/:username', (req, res) => {
  badgeRequests
    .addBadgeRequest(redisClient, req.params.username)
    .then(jobToSchedule => {
      res.send(`id:${jobToSchedule.id}`);
      res.end();
      jobs.push(jobToSchedule);
    });
});

app.listen(8000, () => console.log('listening on 8000...'));
