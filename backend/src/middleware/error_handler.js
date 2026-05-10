import HttpResponses from '../shared/http_responses.js';
const errorHandler = (err, req, res, next) => {
    console.error(err);
    return HttpResponses.serverError(
        res,
        'Internal server error',
        err.message
    );
};
export default errorHandler;