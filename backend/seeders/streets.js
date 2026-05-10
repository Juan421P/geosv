import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as turf from '@turf/turf';
import street from '../src/models/streets.js';
import municipality from '../src/models/municipalities.js';
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
export const streets = async () => {
    try {
        console.log('seeding streets...');
        const dbMunicipalities = await municipality.find({});
        const filePath = path.join(_dirname, '../data/streets.geojson');
        const rawData = fs.readFileSync(filePath, 'utf8');
        const geojsonData = JSON.parse(rawData);
        const streetsToInsert = [];
        for (const feature of geojsonData.features) {
            if (feature.geometry.type !== 'LineString') {
                continue;
            }
            const name = feature.properties.name;
            if (!name) {
                continue;
            }
            let streetType = 'calle';
            const lowerName = name.toLowerCase();
            if (lowerName.includes('avenida')) {
                streetType = 'avenida';
            } else if (lowerName.includes('carretera')) {
                streetType = 'carretera';
            } else if (lowerName.includes('pasaje')) {
                streetType = 'pasaje';
            } else if (lowerName.includes('senda')) {
                streetType = 'senda';
            } else if (lowerName.includes('bulevar')) {
                streetType = 'bulevar';
            } else if (lowerName.includes('alameda')) {
                streetType = 'alameda';
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
            streetsToInsert.push({
                name: name,
                type: streetType,
                municipality: matchedMunicipalityId,
                geometry: {
                    type: feature.geometry.type,
                    coordinates: feature.geometry.coordinates
                }
            });
        }
        console.log(`preparing to insert ${streetsToInsert.length} street segments in batches...`);
        for (let i = 0; i < streetsToInsert.length; i += 1000) {
            const chunk = streetsToInsert.slice(i, i + 1000);
            await street.insertMany(chunk);
            console.log(`inserted batch: ${i} to ${i + chunk.length}`);
        }
        console.log(`successfully seeded all ${streetsToInsert.length} street segments!`);
    } catch (error) {
        console.error('error seeding streets:', error);
        throw error;
    }
};