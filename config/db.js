const { MongoClient } = require('mongodb');
const dotenv = require('dotenv')

dotenv.config();

class DBConnection {

    constructor() {
        this.mongoURI = process.env.MONGO_URI;
        this.databaseName = process.env.MONGO_DATABASE;
        this.connection = null;
    }

    async connect() {
        const client = new MongoClient(this.mongoURI);
        this.connection = await client.connect();
    }

    getConnection() {     
        if (!this.connection) {
            throw new Error('MongoDB connection not established');
          }  
        return this.connection.db(this.databaseName);
    }
}

const instance = new DBConnection();
instance.connect(); 
module.exports = instance;