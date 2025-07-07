"use strict";

const { StatusCodes, ReasonPhrases } = require('../utils/httpStatusCode');

class SuccessResponse {
    constructor({
        message,
        statusCode = StatusCodes.OK,
        reasonStatusCode = ReasonPhrases.OK,
        metadata = {}
    }) {
        this.message = !message ? reasonStatusCode : message;
        this.statusCode = statusCode;
        this.metadata = metadata;
    }

    send(res, headers = {}) {
        return res.status(this.statusCode).json(this);
    }
}


class OkResponse extends SuccessResponse {
    constructor({
        message,
        metadata
    }) {
        super({ message, metadata });
    }
}

class CreatedResponse extends SuccessResponse {
    constructor({
        message,
        metadata,
        options = {}
    }) {
        super({ message, metadata, options });
    }
}

module.exports = { OkResponse, CreatedResponse, SuccessResponse };