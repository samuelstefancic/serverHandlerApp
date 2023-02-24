package work.sam.server.services;
import work.sam.server.exception.ServerException;
import work.sam.server.model.Server;
import work.sam.server.repository.ServerRepository;


import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ServerService {

    private ServerRepository serverRepository;

    public Server findServerByIpAdress(String ipAdress) {
        return serverRepository.findByIpAdress(ipAdress);
    }

    public Server getServerById(Long id) {
        Optional<Server> server = serverRepository.findById(id);
        if (server.isPresent()) {
            return server.get();
        } else {
            throw new ServerException("Server non trouvé " + id);
        }
    }
}
