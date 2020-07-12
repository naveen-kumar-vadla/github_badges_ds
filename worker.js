const redis = require('redis');
const http = require('http');
const badgeRequests = require('./badgeRequests');
const { processBadgeRequest } = require('./processBadges');
const redisClient = redis.createClient({ db: 2 });

const getServerOptions = () => {
  return {
    host: 'localhost',
    port: '8000',
    path: '/request-job',
  };
};

const updateBadge = (id, badge) => {
  console.log('Badge :', badge);
  console.log('completed id :', id, '\n');
  return new Promise((resolve, reject) => {
    badgeRequests
      .completedProcessing(redisClient, id, badge)
      .then(() => resolve('updated'));
  });
};

const getJob = () => {
  return new Promise((resolve, reject) => {
    http.get(getServerOptions(), res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        data = JSON.parse(data);
        if (data.id) resolve(data.id);
        else reject('no job');
      });
    });
  });
};

const processJobAndRequestAgain = id => {
  console.log('\nReceived id :', id);
  badgeRequests.get(redisClient, id).then(data => {
    processBadgeRequest(data.username)
      .then(badge => updateBadge(id, badge).then(main))
      .catch(err => updateBadge(id, err).then(main));
  });
};

const main = () => {
  getJob()
    .then(processJobAndRequestAgain)
    .catch(() => setTimeout(main, 1000));
};

main();
