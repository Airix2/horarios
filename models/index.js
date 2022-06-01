const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const { Association } = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  // port: '5433',

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },

  logging: false
});

const db = {};

/* -------------------------------------------------------------------------- */
/*                  Add Database To SYNC with MYSQL Database                  */
/* -------------------------------------------------------------------------- */

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./users_models")(sequelize, Sequelize);
db.records = require("./records_models")(sequelize, Sequelize);
db.offices = require("./offices_models")(sequelize, Sequelize);
db.history = require("./history_models")(sequelize, Sequelize);
db.reports = require("./reports_models")(sequelize, Sequelize);

module.exports = db;