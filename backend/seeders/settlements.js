import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as turf from '@turf/turf';
import settlement from '../src/models/settlements.js';
import municipality from '../src/models/municipalities.js';
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const forceCloseGeometry = (geometry) => {
    if (geometry.type === 'Polygon') {
        geometry.coordinates.forEach(ring => {
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
                ring.push([first[0], first[1]]);
            }
        });
    } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(polygon => {
            polygon.forEach(ring => {
                const first = ring[0];
                const last = ring[ring.length - 1];
                if (first[0] !== last[0] || first[1] !== last[1]) {
                    ring.push([first[0], first[1]]);
                }
            });
        });
    }
    return geometry;
};
export const settlements = async () => {
    try {
        console.log('seeding settlements...');
        const dbMunicipalities = await municipality.find({});
        const filePath = path.join(_dirname, '../data/settlements.geojson');
        const rawData = fs.readFileSync(filePath, 'utf8');
        const geojsonData = JSON.parse(rawData);
        const settlementsToInsert = [];
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
            let finalGeometry = forceCloseGeometry(feature.geometry);
            const safeFeature = turf.feature(finalGeometry, feature.properties);
            try {
                const repairedFeature = turf.buffer(safeFeature, 0);
                if (repairedFeature && repairedFeature.geometry) {
                    finalGeometry = repairedFeature.geometry;
                }
            } catch (err) {
                console.log(`0-buffer failed for ${name}, trying 1cm microscopic buffer...`);
                try {
                    const cleaned = turf.cleanCoords(safeFeature);
                    const microBuffer = turf.buffer(cleaned, 0.00001, { units: 'kilometers' });
                    if (microBuffer && microBuffer.geometry) {
                        finalGeometry = microBuffer.geometry;
                    }
                } catch (err2) {
                    console.log(`micro-buffer failed for ${name}, deploying the shrink-wrap (convex hull)...`);
                    try {
                        const points = turf.explode(safeFeature);
                        const hull = turf.convex(points);
                        if (hull && hull.geometry) {
                            finalGeometry = hull.geometry;
                        }
                    } catch (err3) {
                        console.log(`all repairs failed for ${name}, falling back to original closed geometry`);
                    }
                }
            }
            settlementsToInsert.push({
                name: name,
                type: feature.properties.place || 'neighbourhood',
                municipality: matchedMunicipalityId,
                geometry: finalGeometry
            });
        }
        try {
            await settlement.insertMany(settlementsToInsert, { ordered: false });
            console.log(`successfully seeded ${settlementsToInsert.length} settlements!`);
        } catch (insertError) {
            if (insertError.name === 'MongoBulkWriteError') {
                const failedCount = insertError.writeErrors.length;
                const successCount = settlementsToInsert.length - failedCount;
                console.log(`successfully seeded ${successCount} settlements!`);
                console.log(`warning: mongodb permanently rejected ${failedCount} unsalvageable shapes.`);
            } else {
                throw insertError;
            }
        }
    } catch (error) {
        console.error('error seeding settlements:', error);
        throw error;
    }
};