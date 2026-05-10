import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import requestLogger from './src/middleware/request_logger.js';
import notFound from './src/middleware/not_found.js';
import errorHandler from './src/middleware/error_handler.js';
import validateCoordinates from './src/middleware/validate_coordinates.js';
import address from './src/routes/address.js';
import department from './src/routes/department.js';
import district from './src/routes/district.js';
import municipality from './src/routes/municipality.js';
import nearestStreet from './src/routes/nearest_street.js';
import settlement from './src/routes/settlement.js';
const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(requestLogger);
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'too many requests, please try again later'
    }
}));
app.use('/api', validateCoordinates);
app.use('/api/address', address);
app.use('/api/department', department);
app.use('/api/district', district);
app.use('/api/municipality', municipality);
app.use('/api/nearest-street', nearestStreet);
app.use('/api/settlement', settlement);
app.use(notFound);
app.use(errorHandler);
export default app;