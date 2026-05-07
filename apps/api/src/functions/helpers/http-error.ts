/**
 * Custom HTTP Error class for Express responses
 */
export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }

  /**
   * Create a 400 Bad Request error
   */
  static badRequest(message = "Bad Request"): HttpError {
    return new HttpError(400, message);
  }

  /**
   * Create a 401 Unauthorized error
   */
  static unauthorized(message = "Unauthorized"): HttpError {
    return new HttpError(401, message);
  }

  /**
   * Create a 403 Forbidden error
   */
  static forbidden(message = "Forbidden"): HttpError {
    return new HttpError(403, message);
  }

  /**
   * Create a 404 Not Found error
   */
  static notFound(message = "Not Found"): HttpError {
    return new HttpError(404, message);
  }

  /**
   * Create a 405 Method Not Allowed error
   */
  static methodNotAllowed(message = "Method Not Allowed"): HttpError {
    return new HttpError(405, message);
  }

  /**
   * Create a 500 Internal Server Error
   */
  static internalServer(message = "Internal Server Error"): HttpError {
    return new HttpError(500, message);
  }
}
