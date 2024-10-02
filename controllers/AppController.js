import dbClient from '../utils/db';
import redisClient from '../utils/redis'

const getStatus = async (req, res) => {
    try {
        const redis = await redisClient.isAlive();
        const db = await dbClient.isAlive();

        if (redis && db) {
            res.status(200).json({ "redis": true, "db": true })
        }
    } catch (err) {
        console.err(err);
        res.status(500).send(err);
    }
}

const getStats = async (req, res) => {
    try {
        const users = await dbClient.nbUsers();
        const files = await dbClient.nbFiles();
        const response = { "users": users, "files": files }

        res.status(200).json(response);
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
}

module.exports = { getStats, getStatus }