import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as turf from '@turf/turf';
import district from '../src/models/districts.js';
import municipality from '../src/models/municipalities.js';
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
export const districts = async () => {
    try {
        console.log('seeding districts...');
        const dbMunicipalities = await municipality.find({});
        const filePath = path.join(_dirname, '../data/districts.geojson');
        const rawData = fs.readFileSync(filePath, 'utf8');
        const geojsonData = JSON.parse(rawData);
        const districtsToInsert = [];
        for (const feature of geojsonData.features) {
            if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
                continue;
            }
            const name = feature.properties.name;
            if (!name) {
                continue;
            }
            const centerPoint = turf.centroid(feature);
            let matchedMunicipalityId = null;
            for (const mun of dbMunicipalities) {
                if (turf.booleanPointInPolygon(centerPoint, mun.geometry)) {
                    matchedMunicipalityId = mun._id;
                    break;
                }
            }
            if (!matchedMunicipalityId) {
                continue;
            }
            let finalGeometry = feature.geometry;
            try {
                const repairedFeature = turf.buffer(feature, 0);
                if (repairedFeature && repairedFeature.geometry) {
                    finalGeometry = repairedFeature.geometry;
                }
            } catch (err) {
                console.log(`could not buffer ${name}, falling back to original geometry`);
            }
            districtsToInsert.push({
                name: name,
                municipality: matchedMunicipalityId,
                geometry: finalGeometry
            });
        }
        await district.insertMany(districtsToInsert);
        console.log(`successfully seeded ${districtsToInsert.length} districts!`);
    } catch (error) {
        console.error('error seeding districts:', error);
        throw error;
    }
};