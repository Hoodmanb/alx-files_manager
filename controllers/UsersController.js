import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjectId } from 'mongodb';

const hashPassword = (pass) => {
    return crypto.createHash('sha1').update(pass).digest('hex');
};

const connect = async () => {
    await dbClient.connect();
};

connect();

const db = dbClient.client.db(dbClient.database);

const postNew = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Missing password' });
    }

    try {
        const emailExist = await db.collection('users').findOne({ email });

        if (emailExist) {
            return res.status(400).json({ error: 'Already exists' });
        }

        const hashedPassword = hashPassword(password);
        const user = {
            email,
            password: hashedPassword,
        };

        const result = await db.collection('users').insertOne(user);
        return res.status(201).json({ email: email, id: result.insertedId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

const getMe = async (req, res) => {
    const token = req.headers['x-token'];

    if (!token) {
        return res.status(401).json({ error: 'No Header Set' })
    }
    const id = await redisClient.get(token);
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: { email: 1 } });

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized ' })
    }

    const { email, _id } = user;
    return res.json({ email, _id })

}

export default { postNew, getMe };
