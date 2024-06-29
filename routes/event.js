const events = require(`../models/event`);

const eventRoute = async (req, res) =>
  res.json(
    await events
      .aggregate([
        {
          $match: {
            date: {
              $gte: new Date(),
              $lt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
            },
          },
        },
        {
          $lookup: {
            from: `users`,
            localField: `author`,
            foreignField: `_id`,
            as: `author`,
          },
        },
        {
          $project: {
            title: 1,
            picture: 1,
            description: 1,
            date: 1,
            venue: 1,
            duration: 1,
            author: { $arrayElemAt: [`$author`, 0] },
          },
        },
      ])
      .toArray()
  );

module.exports = eventRoute;
