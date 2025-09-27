const mongoose = require('mongoose');
require('dotenv').config();

let dbUser = process.env.DB_USER;
let dbPassword = process.env.DB_PASSWORD;
let dbName = process.env.DB_NAME

async function connectToDb() { 
    await mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.emtxpzn.mongodb.net/${dbName}`);
}

module.exports ={
    connectToDb
}