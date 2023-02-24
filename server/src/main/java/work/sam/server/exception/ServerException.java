package work.sam.server.exception;

public class ServerException extends RuntimeException{
    public ServerException(String exceptionMessage) {
        super(exceptionMessage);
    }
}
