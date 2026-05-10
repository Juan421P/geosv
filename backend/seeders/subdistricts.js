import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as turf from '@turf/turf';
import subdistrict from '../src/models/subdistricts.js';
import district from '../src/models/districts.js';
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
export const subdistricts = async () => {
    try {
        console.log('seeding subdistricts...');
        const dbDistricts = await district.find({});
        const filePath = path.join(_dirname, '../data/subdistricts.geojson');
        const rawData = fs.readFileSync(filePath, 'utf8');
        const geojsonData = JSON.parse(rawData);
        const subdistrictsToInsert = [];
        for (const feature of geojsonData.features) {
            if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
                continue;
            }
            const name = feature.properties.name;
            if (!name) {
                continue;
            }
            const centerPoint = turf.centroid(feature);
            let matchedDistrictId = null;
            for (const dist of dbDistricts) {
                if (turf.booleanPointInPolygon(centerPoint, dist.geometry)) {
                    matchedDistrictId = dist._id;
                    break;
                }
            }
            if (!matchedDistrictId) {
                continue;
            }
            let finalGeometry = feature.geometry;
            try {
                const repairedFeature = turf.buffer(feature, 0);
                if (repairedFeature && repairedFeature.geometry) {
                    finalGeometry = repairedFeature.geometry;
                }
            } catch (err) {
                console.log(`0-buffer failed for ${name}, trying 1cm microscopic buffer...`);
                try {
                    const cleaned = turf.cleanCoords(feature);
                    const microBuffer = turf.buffer(cleaned, 0.00001, { units: 'kilometers' });
                    if (microBuffer && microBuffer.geometry) {
                        finalGeometry = microBuffer.geometry;
                    }
                } catch (err2) {
                    console.log(`micro-buffer failed for ${name}, deploying the shrink-wrap (convex hull)...`);
                    try {
                        const points = turf.explode(feature);
                        const hull = turf.convex(points);
                        if (hull && hull.geometry) {
                            finalGeometry = hull.geometry;
                        }
                    } catch (err3) {
                        console.log(`all repairs failed for ${name}, falling back to original`);
                    }
                }
            }
            subdistrictsToInsert.push({
                name: name,
                district: matchedDistrictId,
                geometry: finalGeometry
            });
        }
        try {
            await subdistrict.insertMany(subdistrictsToInsert, { ordered: false });
            console.log(`successfully seeded ${subdistrictsToInsert.length} subdistricts!`);
        } catch (insertError) {
            if (insertError.name === 'MongoBulkWriteError') {
                const failedCount = insertError.writeErrors.length;
                const successCount = subdistrictsToInsert.length - failedCount;
                console.log(`successfully seeded ${successCount} subdistricts!`);
                console.log(`warning: mongodb permanently rejected ${failedCount} unsalvageable shapes.`);
            } else {
                throw insertError;
            }
        }
    } catch (error) {
        console.error('error seeding subdistricts:', error);
        throw error;
    }
};