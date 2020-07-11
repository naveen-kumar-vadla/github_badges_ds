const express = require('express');
const https = require('https');
const { resolve } = require('path');

const app = express();

//https://api.github.com/users/naveen-kumar-vadla
const getApiOptions = () => ({
  host: 'api.github.com',
  path: '/users/',
  headers: {
    'user-agent':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    Authorization: 'token fce5f75cc8126367b0dc612862a9979f3950363d',
  },
  Accept: 'application/json',
  method: 'get',
});

//log request url and method
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const requestAndGetData = options => {
  return new Promise((resolve, reject) => {
    const request = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        data = JSON.parse(data);
        if (data.message) reject(data);
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
    const data = await requestAndGetData(options).catch(err => {});
    Object.keys(data).forEach(l => languages.add(l));
  }
  return Array.from(languages);
}

const assignBadge = noOfLanguages => {
  let badge = 'Bronze';
  if (noOfLanguages >= 4 && noOfLanguages <= 6) badge = 'Silver';
  if (noOfLanguages >= 7 && noOfLanguages <= 10) badge = 'Gold';
  if (noOfLanguages >= 11 && noOfLanguages <= 15) badge = 'Platinum';
  if (noOfLanguages > 15) badge = 'Emerald';
  return badge;
};

app.post('/badge/:username', (req, res) => {
  const options = getApiOptions();
  options.path += req.params.username + '/repos';
  requestAndGetData(options)
    .then(repos => {
      const repoNamesList = repos.map(repo => repo.name);
      getLanguagesUsed(req.params.username, repoNamesList).then(languages => {
        res.write(JSON.stringify(assignBadge(languages.length)));
        res.end();
      });
    })
    .catch(err => {
      res.write(JSON.stringify(err.message));
      res.end();
    });
});

app.listen(5000, () => console.log(`listening on ${5000}...`));
