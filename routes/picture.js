var ObjectId = require(`mongodb`).ObjectId;
const request = require("request");

const users = require(`../models/user`);

const pictureRoute = async ({ query: { _id } }, res) => {
  const { picture } = await users.findOne(new ObjectId(_id));
  request(
    {
      url: picture,
      encoding: null,
    },
    (err, resp, buffer) => {
      if (!err && resp.statusCode === 200) {
        res.set("Content-Type", "image/jpeg");
        res.send(resp.body);
      }
    }
  );
};

module.exports = pictureRoute;
