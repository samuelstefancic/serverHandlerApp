package work.sam.server;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import work.sam.server.enumeration.Status;
import work.sam.server.model.Server;
import work.sam.server.services.ServerService;

import java.util.function.BooleanSupplier;
import org.junit.jupiter.api.Assertions.*;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeAll;


@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ServerServiceTest {

    @Autowired
    private ServerService serverService;

    @BeforeAll
    void create() {
        Server item = new Server();
        item.setIpAdress("192.168.0.0");
        item.setName("Aws_Server");
        item.setStatus(Status.SERVER_UP);
        serverService.createServer(item);
    }

    @Test
    void testCreation() {
        assertNotNull(serverService.getServerByName("Aws_Server"));
    }

}
