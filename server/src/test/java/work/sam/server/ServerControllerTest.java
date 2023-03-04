package work.sam.server;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringRunner;
import work.sam.server.controller.ServerController;
import work.sam.server.model.Response;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@RunWith(SpringRunner.class)
@SpringBootTest
public class ServerControllerTest {
    @Autowired
    private ServerController controller;

    @Test
    public void testGetServer() {
        ResponseEntity<Response> response = controller.getServer();
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Récupération des serveurs", response.getBody().getMessage());
        assertNotNull(response.getBody().getData());
        assertTrue(response.getBody().getData().containsKey("servers"));
        assertTrue(response.getBody().getData().get("servers") instanceof List);
        assertTrue(((List)response.getBody().getData().get("servers")).size() <= 10);
    }
}
