const getCurrId = client => {
  return new Promise((resolve, reject) =>
    client.incr('current_id', (err, res) => resolve(res))
  );
};

const createJob = (client, id, username) => {
  return new Promise((resolve, reject) => {
    const status = ['status', 'scheduled'];
    const receivedAt = ['receivedAt', new Date()];
    const usernameField = ['username', username];
    const fields = status.concat(receivedAt, usernameField);
    client.hmset(`job_${id}`, fields, (err, res) =>
      resolve({ id, username, status: status[1], receivedAt: receivedAt[1] })
    );
  });
};

const addBadgeRequest = (client, username) => {
  return getCurrId(client).then(id => createJob(client, id, username));
};

const completedProcessing = (client, id, badge) => {
  return new Promise((resolve, reject) => {
    const status = ['status', 'completed'];
    const badgeField = ['badge', badge];
    const completed = ['completedAt', new Date()];
    const fields = status.concat(badgeField, completed);
    client.hmset(`job_${id}`, fields, (err, res) => resolve(res));
  });
};

const get = (client, id) => {
  return new Promise((resolve, reject) => {
    client.hgetall(`job_${id}`, (err, res) => resolve(res));
  });
};

module.exports = { addBadgeRequest, completedProcessing, get };
