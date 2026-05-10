import municipalities from '../models/municipalities.js';
import HttpResponses from '../shared/http_responses.js';
export default class Municipality {
    handle = async (req, res) => {
        try {
            const { coordinates } = req.body;
            if (!coordinates || coordinates.length !== 2) {
                return HttpResponses.badRequest(res, 'invalid coordinates');
            }
            const result = await municipality.findOne({
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
                return HttpResponses.notFound(res, 'no municipality found at these coordinates');
            }
            return HttpResponses.ok(res, { _id: result._id, name: result.name });
        } catch (error) {
            console.error('error in municipality controller:', error);
            return HttpResponses.serverError(res, 'internal server error', error.message);
        }
    };
}