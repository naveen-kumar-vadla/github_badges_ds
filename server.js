const http = require('http');
const express = require('express');
const { BadgeRequests } = require('./badges');

const app = express();

let isWorkerFree = true;
const jobs = []; // { id: id, params: params }
const badgeRequests = new BadgeRequests();

const getWorkerOptions = () => {
  return {
    host: 'localhost',
    path: '/badge/',
    port: '5000',
    method: 'post',
  };
};

const delegateToWorker = (id, username) => {
  const options = getWorkerOptions();
  options.path += id + '/' + username;
  const request = http.request(options, res => {
    console.log('Got from worker', res.statusCode);
  });
  request.end();
};

setInterval(() => {
  if (isWorkerFree && jobs.length) {
    const job = jobs.shift();
    console.log('Scheduling jon on worker : ', job.id);
    delegateToWorker(job.id, job.username);
  }
}, 1000);

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
  isWorkerFree = true;
  res.end();
});

app.post('/:username', (req, res) => {
  const jobToSchedule = badgeRequests.addBadgeRequest(req.params.username);
  res.send(`id:${jobToSchedule.id}`);
  res.end();
  jobs.push(jobToSchedule);
});

app.listen(8000, () => console.log('listening on 8000...'));
