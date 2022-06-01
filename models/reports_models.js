module.exports = (sequelize, Sequelize) => {

    const Reports = sequelize.define("reports", {
        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            unique: true
        },
        userId: {
            type: Sequelize.UUID
        },
        officeId: {
            type: Sequelize.UUID
        },
        date: {
            type: Sequelize.DATEONLY
        },
        cash: {
            type: Sequelize.JSONB
        },
        debit: {
            type: Sequelize.JSONB
        },
        void_receipt: {
            type: Sequelize.JSONB
        },
        escrow: {
            type: Sequelize.JSONB
        },
        hawksoft: {
            type: Sequelize.DECIMAL(10, 2)
        },
        total: {
            type: Sequelize.DECIMAL(10, 2)
        },
        came: {
            type: Sequelize.JSONB
        },
        went: {
            type: Sequelize.JSONB
        },
        type: {
            type: Sequelize.STRING
        }
    }, {
        tableName: 'iReports'
    }, {
        timestamps: true
    });

    return Reports;
};