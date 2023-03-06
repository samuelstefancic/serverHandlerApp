package work.sam.server.exception;

import org.springframework.http.HttpStatus;

public class ServerException extends RuntimeException{
    private final HttpStatus httpStatus;

    public ServerException(String exceptionMessage, HttpStatus httpStatus) {
        super(exceptionMessage);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
