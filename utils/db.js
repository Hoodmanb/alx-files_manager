import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        this.database = process.env.DB_DATABASE || 'files_manager';

        const uri = `mongodb://${host}:${port}/${this.database}`;
        this.client = new MongoClient(uri);
    }

    isAlive = async () => {
        try {
            await this.client.connect();
            return true;
        } catch (err) {
            return false;
        }
    }

    async connect() {
        if (this.isAlive() !== true) {
            try {
                await this.client.connect();
                console.log('db connedcted')
            } catch (err) {
                console.error('Failed to connect to MongoDB:', err);
            }
        } else {
            console.log('db already connected')
        }

    }


    async nbUsers() {
        try {
            const db = this.client.db(this.database);
            const count = await db.collection('users').countDocuments();
            return count;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async nbFiles() {
        try {
            const db = this.client.db(this.database);
            const count = await db.collection('files').countDocuments();
            return count;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

}

const dbClient = new DBClient();

export default dbClient;