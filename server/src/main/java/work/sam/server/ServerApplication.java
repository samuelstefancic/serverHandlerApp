package work.sam.server;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import work.sam.server.services.ServerService;

@SpringBootApplication
public class ServerApplication implements CommandLineRunner {

	@Autowired
	private ServerService serverService;
	public static void main(String[] args) {
		SpringApplication.run(ServerApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {

	}
}
