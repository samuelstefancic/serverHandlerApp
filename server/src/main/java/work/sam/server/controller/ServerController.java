package work.sam.server.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work.sam.server.enumeration.Status;
import work.sam.server.exception.ServerException;
import work.sam.server.model.Response;
import work.sam.server.model.Server;
import work.sam.server.services.ServerService;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static org.springframework.http.MediaType.IMAGE_PNG_VALUE;

@RestController
@RequestMapping("/server")
@RequiredArgsConstructor
public class ServerController {
    private final ServerService serverService;

    private static final Logger logger = LoggerFactory.getLogger(ServerController.class);

    //read as whole, list of 20
    @GetMapping("/list")
    public ResponseEntity<Response> getServer() throws InterruptedException {
        HttpStatus status = HttpStatus.OK;
        List<Server> servers = serverService.list(20);
        if (servers.isEmpty()) {
            status = HttpStatus.NO_CONTENT;
        }
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

    @GetMapping("/ping/{ipAdress}")
    public ResponseEntity<Response> ping(@PathVariable("ipAdress") String ipAdress) {
        Server server = serverService.ping(ipAdress);
        HttpStatus status = server != null ? HttpStatus.OK : HttpStatus.NO_CONTENT;
        String message = server != null ? "ping ok" : "ping fail";
        return ResponseEntity.ok(
            Response.builder()
                    .time(LocalDate.now())
                    .data(Map.of("server", server))
                    .message(message)
                    .httpStatus(status)
                    .statusCode(status.value())
                    .build()
        );
    }
    //Read objet précis
    @GetMapping("/list/{ipAdress}")
    public ResponseEntity<Response> pingServer(@PathVariable("ipAdress") String ipAdress) {
        Server server = serverService.getServerByIp(ipAdress);
        server.setLastPing(LocalDateTime.now());
        HttpStatus status = HttpStatus.OK;
        if (server == null) {
            status = HttpStatus.NO_CONTENT;
            throw new ServerException("Server is not responding to pings", HttpStatus.NO_CONTENT);
        } else {
            server.setStatus(Status.SERVER_UP);
        }
        if (server.getStatus() == Status.SERVER_DOWN) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
        }
        return ResponseEntity.ok(
                Response.builder()
                        .time(LocalDate.now())
                        .data(Map.of("server", server))
                        .message(server.getStatus() == Status.SERVER_UP ? "ping success" : "ping fail")
                        .httpStatus(status)
                        .statusCode(status.value())
                        .build()
        );
    }

    //Retourner serveur seul
    @GetMapping("/{id}")
    public ResponseEntity<Response> readServerId(@PathVariable("id") Long id) {
        Server server = serverService.getServerById(id);
        server.setLastPing(LocalDateTime.now());
        HttpStatus status = HttpStatus.OK;
        if (server == null) {
            status = HttpStatus.NO_CONTENT;
            throw new ServerException("Server is not responding to pings", HttpStatus.NO_CONTENT);
        } else {
            server.setStatus(Status.SERVER_UP);
        }
        if (server.getStatus() == Status.SERVER_DOWN) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
        }
        return ResponseEntity.ok(
                Response.builder()
                        .time(LocalDate.now())
                        .data(Map.of("server", server))
                        .message(server.getStatus() == Status.SERVER_UP ? "ping success" : "ping fail")
                        .httpStatus(status)
                        .statusCode(status.value())
                        .build()
        );
    }

    //Update
    @PutMapping("/{id}")
    public ResponseEntity<Response> updateServer(@PathVariable Long id,
                                                 @RequestBody @Valid Server updatedServer) {
        Server server = serverService.updateServer(id, updatedServer);
        Response response = Response.builder()
                .httpStatus(HttpStatus.CREATED)
                .message("Server update is a success")
                .data(Map.of("server", server))
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    //save

    @PostMapping("/save")
    public ResponseEntity<Response> saveServer(@RequestBody @Valid Server server) {
        if (server.getStatus() == null) {
            server.setStatus(Status.SERVER_DOWN);
        }
        server.setLastPing(LocalDateTime.now());
        Response response = Response.builder()
                .httpStatus(HttpStatus.CREATED)
                .message("Server creation is a success")
                .data(Map.of("server", serverService.create(server)))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    //delete

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Response> deleteServer(@PathVariable long id) {
        Server server = serverService.getServerById(id);
        if (server == null) {
            throw new ServerException("This server does not exist", HttpStatus.NOT_FOUND);
        } else {
            serverService.deleteServerById(server.getId());
        }
        Response response = Response.builder()
                .httpStatus(HttpStatus.OK)
                .message("server is deleted")
                .data(Map.of("serverId", id))
                .build();
        return ResponseEntity.ok().body(response);
    }

    @GetMapping(path = "/image/{fileName}", produces = IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getServerImage(@PathVariable("fileName") String fileName) throws IOException {
        try {
            URL url = getClass().getResource("/images/" + fileName);
            if (url == null) {
                throw new FileNotFoundException("Image not found");
            }
            Path path = Paths.get(url.toURI());
            byte[] imageBytes = Files.readAllBytes(path);
            return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(imageBytes);
        } catch (NoSuchFileException e) {
            logger.error("Could not find image", e);
            throw e;
        } catch (IOException e) {
            logger.error("Could not read image", e);
            throw e;
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }
}
