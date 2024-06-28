const database = require(`../db`);

const events = database.collection(`events`);

module.exports = events;
