const http = require('http');

class Scheduler {
  constructor(workerOptions) {
    this.jobs = [];
    this.isWorkerFree = true;
    this.workerOptions = workerOptions;
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
    const options = Object.assign({}, this.workerOptions);
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
