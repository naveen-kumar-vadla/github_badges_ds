class BadgeRequests {
  constructor() {
    this.badgeRequests = {};
    this.id = 0;
  }
  addBadgeRequest(username) {
    const jobToSchedule = Object.assign({ id: this.id }, { username });
    this.badgeRequests[this.id] = Object.assign({}, { username });
    this.badgeRequests[this.id].status = 'Scheduled';
    this.badgeRequests[this.id].receivedAt = new Date();
    this.id++;
    return jobToSchedule;
  }
  completedProcessing(id, badge) {
    this.badgeRequests[id].status = 'Completed';
    this.badgeRequests[id].badge = badge;
  }
  get(id) {
    return Object.assign({}, this.badgeRequests[id]);
  }
}

module.exports = { BadgeRequests };
