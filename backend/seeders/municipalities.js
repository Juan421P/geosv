import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as turf from '@turf/turf';
import municipality from '../src/models/municipalities.js';
import department from '../src/models/departments.js';
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
export const municipalities = async () => {
    try {
        console.log('seeding municipalities...');
        const dbDepartments = await department.find({});
        const filePath = path.join(_dirname, '../data/municipalities.geojson');
        const rawData = fs.readFileSync(filePath, 'utf8');
        const geojsonData = JSON.parse(rawData);
        const municipalitiesToInsert = [];
        for (const feature of geojsonData.features) {
            const centerPoint = turf.centroid(feature);
            let matchedDepartmentId = null;
            for (const dept of dbDepartments) {
                if (turf.booleanPointInPolygon(centerPoint, dept.geometry)) {
                    matchedDepartmentId = dept._id;
                    break;
                }
            }
            if (!matchedDepartmentId) {
                console.log(`warning: could not find parent department for ${feature.properties.name}`);
                continue;
            }
            municipalitiesToInsert.push({
                name: feature.properties.name,
                department: matchedDepartmentId,
                geometry: {
                    type: feature.geometry.type,
                    coordinates: feature.geometry.coordinates
                }
            });
        }
        await municipality.insertMany(municipalitiesToInsert);
        console.log(`successfully seeded ${municipalitiesToInsert.length} municipalities!`);
    } catch (error) {
        console.error('error seeding municipalities:', error);
        throw error;
    }
};