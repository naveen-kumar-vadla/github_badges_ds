const redis = require('redis');
const badgeRequests = require('./badgeRequests');
const { processBadgeRequest } = require('./processBadges');
const redisClient = redis.createClient({ db: 2 });

const updateBadge = (id, badge) => {
  console.log('Badge :', badge);
  console.log('completed id :', id);
  return new Promise((resolve, reject) => {
    badgeRequests
      .completedProcessing(redisClient, id, badge)
      .then(() => resolve('updated'));
  });
};

const getJob = () => {
  return new Promise((resolve, reject) => {
    redisClient.brpop('ipQueue', 1, (err, res) => {
      if (res) resolve(Number(res[1]));
      else reject('no job');
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

const main = () => getJob().then(processJobAndRequestAgain).catch(main);

main();
