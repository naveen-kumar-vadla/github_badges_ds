const http = require('http');

const getWorkerOptions = () => {
  return {
    host: 'localhost',
    path: '/badge/',
    port: '5000',
    method: 'post',
  };
};

class Scheduler {
  constructor() {
    this.jobs = [];
    this.isWorkerFree = true;
  }
  schedule(job) {
    this.jobs.push(job);
  }
  start() {
    setInterval(() => {
      if (this.isWorkerFree && this.jobs.length) {
        const job = this.jobs.shift();
        console.log('Scheduling jon on worker : ', job.id);
        this.delegateToWorker(job.id, job.username);
      }
    }, 1000);
  }
  delegateToWorker(id, username) {
    const options = getWorkerOptions();
    options.path += id + '/' + username;
    const request = http.request(options, res => {
      console.log('Got from worker', res.statusCode);
    });
    request.end();
    this.isWorkerFree = false;
  }
  setWorkerFree() {
    this.isWorkerFree = true;
  }
}

module.exports = { Scheduler };
