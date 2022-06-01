module.exports = (sequelize, Sequelize) => {

    const Offices = sequelize.define("office", {

        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            unique: true
        },
        name: {
            type: Sequelize.STRING,
        },
        createdBy: {
            type: Sequelize.STRING,
        },
        ranch: {
            type: Sequelize.DECIMAL(10, 2)
        },
        terminals_ID: {
            type: Sequelize.STRING
        },
        alter_names: {
            type: Sequelize.STRING
        }
    }, {
        tableName: 'iOffices'
    }, {
        timestamps: true
    });

    return Offices;
};