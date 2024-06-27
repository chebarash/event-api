const { MongoClient } = require("mongodb");

const { MONGODB } = process.env;

const client = new MongoClient(MONGODB);
const database = client.db("test");

module.exports = database;
