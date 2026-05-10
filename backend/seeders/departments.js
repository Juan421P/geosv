import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import department from '../src/models/departments.js';
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
export const departments = async () => {
    try {
        console.log('seeding departments...');
        const filePath = path.join(_dirname, '../data/departments.geojson');
        const rawData = fs.readFileSync(filePath, 'utf8');
        const geojsonData = JSON.parse(rawData);
        const departmentsToInsert = geojsonData.features.map(feature => {
            return {
                name: feature.properties.name,
                geometry: {
                    type: feature.geometry.type,
                    coordinates: feature.geometry.coordinates
                }
            };
        });
        await department.insertMany(departmentsToInsert);
        console.log(`successfully seeded ${departmentsToInsert.length} departments!`);
    } catch (error) {
        console.error('error seeding departments:', error);
        throw error;
    }
};