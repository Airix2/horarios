module.exports = (sequelize, Sequelize) => {

    const Records = sequelize.define("records", {

        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            unique: true
        },
        officeId: {
            type: Sequelize.UUID
        },
        date: {
            type: Sequelize.DATEONLY
        },
        hawksoft: {
            type: Sequelize.DECIMAL(10, 2)
        },
        visa: {
            type: Sequelize.DECIMAL(10, 2)
        },
        cash: {
            type: Sequelize.DECIMAL(10, 2)
        },
        extra: {
            type: Sequelize.DECIMAL(10, 2)
        },
        notes: {
            type: Sequelize.STRING
        },
        total: {
            type: Sequelize.DECIMAL(10, 2)
        },
        adjustments: {
            type: Sequelize.DECIMAL(10, 2)
        },
        went_to: {
            type: Sequelize.DECIMAL(10, 2)
        },
        came_to: {
            type: Sequelize.DECIMAL(10, 2)
        },
        void_receipt: {
            type: Sequelize.DECIMAL(10, 2)
        },
        escrow: {
            type: Sequelize.DECIMAL(10, 2)
        },
        other: {
            type: Sequelize.DECIMAL(10, 2)
        }
    }, {
        tableName: 'iRecords'
    }, {
        timestamps: true
    });

    return Records;
};