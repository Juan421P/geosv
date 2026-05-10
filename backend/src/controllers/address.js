import departments from '../models/departments.js';
import municipalities from '../models/municipalities.js';
import districts from '../models/districts.js';
import subdistricts from '../models/subdistricts.js';
import settlements from '../models/settlements.js';
import streets from '../models/streets.js';
import HttpResponses from '../shared/http_responses.js';
export default class Address {
    handle = async (req, res) => {
        try {
            const { coordinates } = req.body;
            if (!coordinates || coordinates.length !== 2) {
                return HttpResponses.badRequest(res, 'invalid coordinates');
            }
            const point = {
                type: 'Point',
                coordinates: coordinates
            };
            const geoIntersectQuery = { geometry: { $geoIntersects: { $geometry: point } } };
            const nearQuery = { geometry: { $near: { $geometry: point, $maxDistance: 50 } } };
            const [dept, mun, dist, subdist, setl, str] = await Promise.all([
                departments.findOne(geoIntersectQuery).lean(),
                municipalities.findOne(geoIntersectQuery).lean(),
                districts.findOne(geoIntersectQuery).lean(),
                subdistricts.findOne(geoIntersectQuery).lean(),
                settlements.findOne(geoIntersectQuery).lean(),
                streets.findOne(nearQuery).lean()
            ]);
            const cleanPrefix = (type, name) => {
                if (!name) return null;
                if (!type) return name;
                if (name.toLowerCase().startsWith(type.toLowerCase())) {
                    return name;
                }
                return `${type} ${name}`;
            };
            const addressData = {
                street: str ? cleanPrefix(str.type, str.name) : null,
                settlement: setl ? setl.name : null,
                subdistrict: subdist ? subdist.name : null,
                district: dist ? dist.name : null,
                municipality: mun ? mun.name : null,
                department: dept ? dept.name : null,
            };
            const formattedAddress = Object.values(addressData)
                .filter(value => value !== null)
                .join(', ');
            return HttpResponses.ok(res, {
                formatted_address: formattedAddress,
                components: addressData
            });
        } catch (error) {
            console.error('error in address controller:', error);
            return HttpResponses.serverError(res, 'internal server error', error.message);
        }
    };
}