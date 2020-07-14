const createJob = (client, username) => {
  return new Promise((resolve, reject) => {
    const status = ['status', 'scheduled'];
    const receivedAt = ['receivedAt', new Date()];
    const usernameField = ['username', username];
    const fields = status.concat(receivedAt, usernameField);
    client.hmset(username, fields, (err, res) =>
      resolve({ username, status: status[1], receivedAt: receivedAt[1] })
    );
  });
};

const addBadgeRequest = (client, username) => {
  return createJob(client, username);
};

const completedProcessing = (client, username, badge) => {
  return new Promise((resolve, reject) => {
    const status = ['status', 'completed'];
    const badgeField = ['badge', badge];
    const completed = ['completedAt', new Date()];
    const fields = status.concat(badgeField, completed);
    client.hmset(username, fields, (err, res) => resolve(res));
  });
};

const get = (client, username) => {
  return new Promise((resolve, reject) => {
    client.hgetall(username, (err, res) => resolve(res));
  });
};

module.exports = { addBadgeRequest, completedProcessing, get };
