const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'lucky_bot',
    'postgres',
    'root',
    {
        host: '185.26.121.241',
        port:'5432',
        dialect: 'postgres'
    }
)