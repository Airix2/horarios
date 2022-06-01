//const { sequelize } = require("../models");

//Develop
module.exports = {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASS,
    DB: process.env.DB_NAME,
    dialect: "postgres",
    pool: {
      max: 100,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
    timezone: 'America/Los_Angeles'
    };
    
    // max: maximum number of connection in pool
    // min: minimum number of connection in pool
    // idle: maximum time, in milliseconds, that a connection can be idle before being released
    // acquire: maximum time, in milliseconds, that pool will try to get connection before throwing error