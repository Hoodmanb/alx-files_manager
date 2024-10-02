import express from 'express';
import router from './routes/index.js'
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json());
const port = process.env.PORT || 5000;

app.use(router);

app.listen(port, () => {
    console.log(`Listening on localhost:${port}`)
});

export default app;
