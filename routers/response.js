class Response {
    constructor(code, message, results) {
        this.code = code;
        this.message = message;
        this.results = results;
    }

    static ok(results) {
        return new Response(200, "OK", results);
    }

    static badRequest(message) {
        return new Response(400, message);
    }

    static notFound(message) {
        return new Response(404, message);
    }

    static serverError(message) {
        return new Response(505, message);
    }
}

module.exports = Response;