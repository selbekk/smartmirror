import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import { getDepartures } from './controllers/transports';

const app = express();

app.set('port', process.env.PORT || 8001);

app.use(compression());
app.use(bodyParser.json());
app.use(cors());

// routes
app.get('/api/departures', getDepartures);

export default app;
