const http = require('http');

class Scheduler {
  constructor(workerOptions) {
    this.jobs = [];
    this.isWorkerFree = true;
    this.workerOptions = workerOptions;
  }
  schedule(job) {
    if (this.isWorkerFree) this.delegateToWorker(job);
    else this.jobs.push(job);
  }
  delegateToWorker({ id }) {
    const options = Object.assign({}, this.workerOptions);
    options.path += id;
    const request = http.request(options, res => {
      console.log('Got from worker', res.statusCode);
    });
    request.end();
    this.isWorkerFree = false;
  }
  setWorkerFree() {
    this.isWorkerFree = true;
    if (this.jobs.length) this.delegateToWorker(this.jobs.shift());
  }
}

module.exports = { Scheduler };
