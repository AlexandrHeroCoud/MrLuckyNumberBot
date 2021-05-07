const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'lucky_bot',
    'lucky_bot',
    'root',
    {
        host: 'localhost',
        port:'5432',
        dialect: 'postgres'
    }
)