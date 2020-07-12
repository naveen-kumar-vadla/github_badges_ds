const express = require('express');
const { BadgeRequests } = require('./badges');
const { Scheduler } = require('./scheduler');

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
const badgeRequests = new BadgeRequests();

//log request url and method
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/status/:id', (req, res) => {
  const badge = badgeRequests.get(req.params.id);
  res.write(JSON.stringify(badge));
  res.end();
});

app.post('/completed-job/:id/:badge', (req, res) => {
  console.log('Received Badge : ', req.params.badge);
  badgeRequests.completedProcessing(req.params.id, req.params.badge);
  scheduler.setWorkerFree();
  res.end();
});

app.post('/:username', (req, res) => {
  const jobToSchedule = badgeRequests.addBadgeRequest(req.params.username);
  res.send(`id:${jobToSchedule.id}`);
  res.end();
  scheduler.schedule(jobToSchedule);
});

app.listen(8000, () => console.log('listening on 8000...'));
