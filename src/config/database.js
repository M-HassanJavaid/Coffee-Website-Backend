const mongoose = require('mongoose');
require('dotenv').config();

let dbUser = process.env.DB_USER;
let dbPassword = process.env.DB_PASSWORD;
let dbName = process.env.DB_NAME


async function connectToDb() { 
     await mongoose.connect(`mongodb+srv://hassanjavaidcoder:hassan.92@cluster0.emtxpzn.mongodb.net/coffeeWebsite`)
}   

module.exports ={
    connectToDb
}