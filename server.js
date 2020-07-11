const http = require('http');
const express = require('express');
const app = express();

const getWorkerOptions = () => {
  return {
    host: 'localhost',
    path: '/userData/',
    port: '5000',
    method: 'post',
  };
};

//log request url and method
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/:username', (req, res) => {
  const options = getWorkerOptions();
  options.path += req.params.username; // /userDate/dad-ka-raneesa
  const request = http.request(options, response => {
    let data = '';
    response.on('data', chunk => (data += chunk));
    response.on('end', () => {
      res.write(data);
      res.end();
    });
  });
  request.end();
});

app.listen(8000, () => console.log('listening on 8000...'));
