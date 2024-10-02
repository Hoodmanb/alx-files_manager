import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjectId } from 'mongodb';

const connect = async () => {
    await dbClient.connect();
};

connect();

const db = dbClient.client.db(dbClient.database);

const postUpload = async (req, res) => {
    const token = req.headers['x-token'];

    if (!token) {
        return res.status(401).json({ error: 'No Header Set' })
    }
    const id = await redisClient.get(token);
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized ' })
    }

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) {
        return res(400).json({ err: 'Missing name' });
    }

    if (!file || ['file', 'folder', 'image'].indexOf(type) === -1) {
        return res.status(400).json({ error: 'Missing type' });
    }

    if (!data && type !== 'folder') {
        return res.status(400).json({ error: 'Missing data' })
    }

    if (parentId !== 0)

}