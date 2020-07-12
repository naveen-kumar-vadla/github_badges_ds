const redis = require('redis');
const express = require('express');
const http = require('http');
const { processBadgeRequest } = require('./processBadges');
const app = express();
const redisClient = redis.createClient({ db: 2 });
const badgeRequests = require('./badgeRequests');

const getServerOptions = () => {
  return {
    host: 'localhost',
    port: '8000',
    method: 'post',
  };
};

//log request url and method
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const informWorkerFree = (id, badge) => {
  badgeRequests.completedProcessing(redisClient, id, badge).then(() => {
    const options = getServerOptions();
    options.path = `/completed-job/${id}`;
    const req = http.request(options, () => {});
    req.end();
  });
};

app.post('/badge/:id', (req, res) => {
  res.end();
  badgeRequests.get(redisClient, req.params.id).then(data => {
    processBadgeRequest(data.username)
      .then(badge => informWorkerFree(req.params.id, badge))
      .catch(err => informWorkerFree(req.params.id, err));
  });
});

app.listen(5000, () => console.log(`listening on ${5000}...`));
