import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as turf from '@turf/turf';
import HttpResponses from '../shared/http_responses.js';
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const departmentsPath = path.join(_dirname, '../../data/departments.geojson');
const departmentsData = JSON.parse(fs.readFileSync(departmentsPath, 'utf8'));
const validateCoordinates = (req, res, next) => {
    const { coordinates } = req.body;
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        return HttpResponses.badRequest(
            res,
            'Coordinates must be an array of two numbers: [longitude, latitude]'
        );
    }
    const [lng, lat] = coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
        return HttpResponses.badRequest(res, 'Longitude and latitude must be numbers');
    }
    if (lng < -180 || lng > 180) {
        return HttpResponses.badRequest(res, 'Invalid longitude');
    }
    if (lat < -90 || lat > 90) {
        return HttpResponses.badRequest(res, 'Invalid latitude');
    }
    const point = turf.point(coordinates);
    let isInsideElSalvador = false;
    for (const feature of departmentsData.features) {
        if (turf.booleanPointInPolygon(point, feature)) {
            isInsideElSalvador = true;
            break;
        }
    }
    if (!isInsideElSalvador) {
        return HttpResponses.badRequest(
            res,
            'Coordinates must be within the territorial boundaries of El Salvador.'
        );
    }
    next();
};
export default validateCoordinates;