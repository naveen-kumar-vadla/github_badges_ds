const express = require('express');
const app = express();
const { processBadgeRequest } = require('./processBadges');

//log request url and method
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/badge/:username', (req, res) => {
  processBadgeRequest(req.params.username)
    .then(badge => {
      res.write(badge);
      res.end();
    })
    .catch(err => {
      res.write(err);
      res.end();
    });
});

app.listen(5000, () => console.log(`listening on ${5000}...`));
