const dotenv = require('dotenv');
const https = require('https');
dotenv.config();

//https://api.github.com/users/naveen-kumar-vadla
const getApiOptions = () => ({
  host: 'api.github.com',
  path: '/users/',
  headers: {
    'user-agent':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    Authorization: `token ${process.env.GITHUB_AUTH_TOKEN}`,
  },
  Accept: 'application/json',
  method: 'get',
});

const requestAndGetData = options => {
  return new Promise((resolve, reject) => {
    const request = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        data = JSON.parse(data);
        if (data.message) reject(data.message);
        resolve(data);
      });
    });
    request.end();
  });
};

async function getLanguagesUsed(username, reposList) {
  const languages = new Set();
  for (const repoName of reposList) {
    const options = getApiOptions();
    options.path = `/repos/${username}/${repoName}/languages`;
    const data = await requestAndGetData(options).catch(() => {});
    Object.keys(data).forEach(l => languages.add(l));
  }
  return Array.from(languages);
}

const isInRange = (value, start, end) => value >= start && value <= end;

const assignBadge = noOfLanguages => {
  let badge = 'Emerald';
  if (isInRange(noOfLanguages, 0, 3)) badge = 'Bronze';
  if (isInRange(noOfLanguages, 4, 6)) badge = 'Silver';
  if (isInRange(noOfLanguages, 7, 10)) badge = 'Gold';
  if (isInRange(noOfLanguages, 11, 15)) badge = 'Platinum';
  return badge;
};

async function processBadgeRequest(username) {
  const options = getApiOptions();
  options.path += username + '/repos';
  const repos = await requestAndGetData(options).catch(err => {
    return Promise.reject(err);
  });
  const repoNamesList = repos.map(repo => repo.name);
  const languages = await getLanguagesUsed(username, repoNamesList);
  const badge = assignBadge(languages.length);
  return badge;
}

module.exports = { processBadgeRequest };
