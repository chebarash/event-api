const { Context } = require(`telegraf`);

class MyContext extends Context {
  constructor(update, telegram, options) {
    super(update, telegram, options);
  }

  user = {
    given_name: ``,
    family_name: ``,
    picture: ``,
    email: ``,
    id: 0,
  };
}

module.exports = MyContext;
