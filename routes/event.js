const events = require(`../models/event`);

const eventRoute = async (req, res) => res.json(await events.getEvent());

module.exports = eventRoute;
