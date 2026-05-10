import settlements from '../models/settlements.js';
import HttpResponses from '../shared/http_responses.js';
export default class Settlement {
    handle = async (req, res) => {
        try {
            const { coordinates } = req.body;
            if (!coordinates || coordinates.length !== 2) {
                return HttpResponses.badRequest(res, 'invalid coordinates');
            }
            const result = await settlement.findOne({
                geometry: {
                    $geoIntersects: {
                        $geometry: {
                            type: 'Point',
                            coordinates: coordinates
                        }
                    }
                }
            });
            if (!result) {
                return HttpResponses.notFound(res, 'no settlement found at these coordinates');
            }
            return HttpResponses.ok(res, { _id: result._id, name: result.name, type: result.type });
        } catch (error) {
            console.error('error in settlement controller:', error);
            return HttpResponses.serverError(res, 'internal server error', error.message);
        }
    };
}