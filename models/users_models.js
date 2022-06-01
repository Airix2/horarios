var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(12);

module.exports = (sequelize, Sequelize) => {

    const Users = sequelize.define("user", {

        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            unique: true
        },
        firstname: {
            type: Sequelize.STRING,
        },
        lastname: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        pass: {
            type: Sequelize.STRING
        },
        initials: {
            type: Sequelize.STRING
        },
        user_type: {
            type: Sequelize.STRING
        }
    }, {
        tableName: 'iUsers'
    }, {
        timestamps: true
    });

    // functions which are called before and after calls in sequelize are executed. 
    // For example, if you want to always set a value on a model before saving it
    Users.beforeSave((user, options) => {
        console.log(user.pass)
        user.pass = bcrypt.hashSync(user.pass, salt);
    });

    return Users;
};