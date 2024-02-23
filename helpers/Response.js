class Response {
    constructor(code, message, results) {
        this.code = code;
        this.message = message;
        this.results = results;
    }

    static ok(res, results) {
        // return new Response(200, "OK", results);
        return res.status(200).json(new Response(200, "OK", results));
    }

    static badRequest(res, message) {
        return res.status(400).json(new Response(400, message));
    }

    static unauthorized(res, message) {
        return res.status(401).json(new Response(401, message));
    }

    static notFound(res, message) {
        return res.status(404).json(new Response(404, message));
    }

    static serverError(res, message) {
        return res.status(505).json(new Response(505, message));
    }
}

module.exports = Response;