import streets from '../models/streets.js';
import HttpResponses from '../shared/http_responses.js';
export default class NearestStreet {
    handle = async (req, res) => {
        try {
            const { coordinates } = req.body;
            if (!coordinates || coordinates.length !== 2) {
                return HttpResponses.badRequest(res, 'invalid coordinates');
            }
            const result = await street.findOne({
                geometry: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: coordinates
                        },
                        $maxDistance: 50
                    }
                }
            });
            if (!result) {
                return HttpResponses.notFound(res, 'no street found within 50 meters');
            }
            return HttpResponses.ok(res, { _id: result._id, name: result.name, type: result.type });
        } catch (error) {
            console.error('error in nearest street controller:', error);
            return HttpResponses.serverError(res, 'internal server error', error.message);
        }
    };
}