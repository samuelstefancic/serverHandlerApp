package work.sam.server.model;



import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.experimental.SuperBuilder;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.Map;

@Data
@SuperBuilder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {
    protected LocalDate time;
    protected int statusCode;
    protected HttpStatus httpStatus; //status
    protected String reason;
    protected String message;
    protected String devMessage;
    protected Map<?, ?> data;
}
