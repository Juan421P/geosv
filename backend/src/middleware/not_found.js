import HttpResponses from '../shared/http_responses.js';
const notFound = (req, res, next) => {
    return HttpResponses.notFound(
        res,
        'Route not found'
    );
};
export default notFound;