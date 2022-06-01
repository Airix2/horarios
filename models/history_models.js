module.exports = (sequelize, Sequelize) => {

    const History = sequelize.define("history", {

        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            unique: true
        },
        field: {
            type: Sequelize.STRING
        },
        office: {
            type: Sequelize.STRING
        },
        changedBy: {
            type: Sequelize.STRING
        },
        date: {
            type: Sequelize.DATEONLY
        },
        pastValue: {
            type: Sequelize.STRING
        },
        postValue: {
            type: Sequelize.STRING
        },
        rowValues: {
            type: Sequelize.STRING
        }
    }, {
        tableName: 'iHistory'
    }, {
        timestamps: true
    });

    return History;
};