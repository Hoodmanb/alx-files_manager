import dbClient from '../utils/db';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis'
import { ObjectId } from 'mongodb';

const hashPassword = (pass) => {
    return crypto.createHash('sha1').update(pass).digest('hex');
};

const connect = async () => {
    await dbClient.connect();
};

connect();


const db = dbClient.client.db(dbClient.database);

const getConnect = async (req, res, next) => {
    try {
        const userCollection = db.collection('users');
        const users = await userCollection.find({}).toArray();

        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }

        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [email, password] = credentials.split(':');
        const pass = hashPassword(password);

        const user = users.find(user => user.email === email && user.password === pass);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const randomString = uuidv4();
        const key = `auth_${randomString}`;
        const duration = 24 * 60 * 60 * 1000;
        await redisClient.set(key, user._id, duration);
        return res.status(200).json({ token: key })

        next();
    } catch (err) {
        console.error("Error in getConnect:", err);
        return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
}

const getDisconnect = async (req, res, next) => {
    try {
        const token = req.headers['x-token'];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized ' })
        }
        const id = await redisClient.get(token);
        const user = await db.collection('users').findOne({ _id: new ObjectId(id) });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized ' })
        }

        await redisClient.del(token);
        return res.status(204)
    } catch (err) {
        console.error("Error in getConnect:", err);
        return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
}

module.exports = { getDisconnect, getConnect }
