const http = require('http');
const express = require('express');
const app = express();

let id = 0;
let isWorkerFree = true;
const jobs = []; // { id: id, params: params }
const badges = {};
const getWorkerOptions = () => {
  return {
    host: 'localhost',
    path: '/badge/',
    port: '5000',
    method: 'post',
  };
};

const delegateToWorker = (id, params) => {
  badges[id] = 'Processing ...';
  const options = getWorkerOptions();
  options.path += id + '/' + params.username;
  const request = http.request(options, res => {
    console.log('Got from worker', res.statusCode);
  });
  request.end();
};

setInterval(() => {
  if (isWorkerFree && jobs.length) {
    const job = jobs.shift();
    console.log('Scheduling jon on worker : ', job.id);
    delegateToWorker(job.id, job.params);
  }
}, 1000);

//log request url and method
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/status/:id', (req, res) => {
  res.write(badges[req.params.id]);
  res.end();
});

app.post('/completed-job/:id/:badge', (req, res) => {
  isWorkerFree = true;
  badges[req.params.id] = req.params.badge;
  res.end();
});

app.post('/:username', (req, res) => {
  res.send(`id:${id}`);
  res.end();
  jobs.push({ id, params: req.params });
  badges[id] = 'Scheduled ...';
  id++;
});

app.listen(8000, () => console.log('listening on 8000...'));
