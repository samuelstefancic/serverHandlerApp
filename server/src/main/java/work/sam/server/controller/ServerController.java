package work.sam.server.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import work.sam.server.model.Response;
import work.sam.server.model.Server;
import work.sam.server.services.ServerService;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/server")
@RequiredArgsConstructor
public class ServerController {
    private final ServerService serverService;

    @GetMapping("/list")
    public ResponseEntity<Response> getServer() {
        HttpStatus status = HttpStatus.OK;
        List<Server> servers = serverService.list(10);
        return ResponseEntity.ok(
                Response.builder()
                        .time(LocalDate.now())
                        .data(Map.of("servers", servers))
                        .message("Récupération des serveurs")
                        .httpStatus(status)
                        .statusCode(status.value())
                        .build()

        );
    }
}
