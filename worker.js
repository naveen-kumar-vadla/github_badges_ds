const redis = require('redis');
const badgeRequests = require('./badgeRequests');
const { processBadgeRequest } = require('./processBadges');
const redisClient = redis.createClient({ db: 2 });

const updateBadge = (username, badge) => {
  console.log('Badge :', badge);
  console.log('completed :', username);
  return new Promise((resolve, reject) => {
    badgeRequests
      .completedProcessing(redisClient, username, badge)
      .then(() => resolve('updated'));
  });
};

const getJob = () => {
  return new Promise((resolve, reject) => {
    redisClient.brpop('ipQueue', 1, (err, res) => {
      if (res) resolve(res[1]);
      else reject('no job');
    });
  });
};

const processJobAndRequestAgain = username => {
  console.log('\nReceived :', username);
  processBadgeRequest(username)
    .then(badge => updateBadge(username, badge).then(main))
    .catch(err => updateBadge(username, err).then(main));
};

const main = () => getJob().then(processJobAndRequestAgain).catch(main);

main();
