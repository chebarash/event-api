const events = require(`../models/event`);

const eventRoute = async (req, res) =>
  res.json(
    await events
      .aggregate([
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