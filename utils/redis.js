import { createClient } from 'redis';

class RedisClient {
    constructor() {
        this.client = createClient();

        this.client.on('error', (err) => {
            console.error(err);
        });

        this.client.connect().catch((err) => {
            console.error(err);
        });
    }

    isAlive = async () => {
        const result = await this.client.ping()
            .then((ping) => ping === 'PONG')
            .catch((err) => {
                console.error(err);
                return false;
            });
        return result;
    };


    async get(key) {
        try {
            const value = await this.client.get(key);
            return value;
        } catch (err) {
            console.log(err);
        }
    }

    async set(key, value, duration) {
        try {
            await this.client.setEx(key, duration, String(value));
        } catch (err) {
            console.log(err);
        }
    }

    async del(key) {
        try {
            await this.client.del(key);
        } catch (err) {
            console.log(err);
        }
    }
}

const redisClient = new RedisClient();

export default redisClient;