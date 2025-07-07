const knex = require('knex');
const knexfile = require('../knexfile'); 
const environment = process.env.NODE_ENV || 'development';

class MySQLConnection {
    constructor() {
        this.db = knex(knexfile[environment]);
    }

    static getInstance() {
        if (!MySQLConnection.instance) {
            MySQLConnection.instance = new MySQLConnection();
            console.log('Connected to MySQL using environment:', environment);
        }
        return MySQLConnection.instance.db;
    }
}

module.exports = MySQLConnection.getInstance();
