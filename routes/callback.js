const temp = require(`../temp`);

const { GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL } =
  process.env;

const callbackRoute = async (req, res) => {
  const { code } = req.query;

  const response = await fetch(`https://oauth2.googleapis.com/token`, {
    method: `POST`,
    body: JSON.stringify({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK_URL,
      grant_type: `authorization_code`,
    }),
  });

  const { id_token } = await response.json();

  const token_info_response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`
  );

  if (token_info_response.status == 200) {
    const tempId = (Math.random() + 1).toString(36).substring(7);
    const { given_name, family_name, picture, email } =
      await token_info_response.json();
    temp[tempId] = { given_name, family_name, picture, email };
    return res.redirect(`https://t.me/pueventbot?start=${tempId}`);
  }

  res.status(token_info_response.status).json({ error: true });
};

module.exports = callbackRoute;
