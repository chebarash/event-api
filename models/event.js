const database = require(`../db`);

const events = database.collection(`events`);

events.getEvent = async (match = {}) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  const time = date.getTime();
  return await events
    .aggregate([
      {
        $match: {
          ...match,
          date: {
            $gte: time,
            $lte: time + 60 * 60 * 1000 * 24 * 10,
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
    .toArray();
};

module.exports = events;
