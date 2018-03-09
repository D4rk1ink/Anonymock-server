import * as express from 'express'

export interface Request extends express.Request {
    certificate?: any
}

export interface Response extends express.Response {
    data(data)

    error (data, error)
}

export interface NextFunction extends express.NextFunction { }

export class preResponse {
    public static data (data) {
        return {
            data: data
        }
    }

    public static error (data, error) {
        return {
            data: data,
            error: error
        }
    }
}