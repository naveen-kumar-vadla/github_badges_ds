const redis = require('redis');
const express = require('express');
const badgeRequests = require('./badgeRequests');
const { Scheduler } = require('./scheduler');
const redisClient = redis.createClient({ db: 2 });

const getWorkerOptions = () => {
  return {
    host: 'localhost',
    path: '/badge/',
    port: '5000',
    method: 'post',
  };
};

const app = express();
const scheduler = new Scheduler(getWorkerOptions());

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

app.post('/completed-job/:id/:badge', (req, res) => {
  console.log('Received Badge : ', req.params.badge);
  badgeRequests
    .completedProcessing(redisClient, req.params.id, req.params.badge)
    .then(() => {
      scheduler.setWorkerFree();
      res.end();
    });
});

app.post('/:username', (req, res) => {
  badgeRequests
    .addBadgeRequest(redisClient, req.params.username)
    .then(jobToSchedule => {
      res.send(`id:${jobToSchedule.id}`);
      res.end();
      scheduler.schedule(jobToSchedule);
    });
});

app.listen(8000, () => console.log('listening on 8000...'));
