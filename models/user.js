const database = require("../db");

const users = database.collection("users");

module.exports = users;
