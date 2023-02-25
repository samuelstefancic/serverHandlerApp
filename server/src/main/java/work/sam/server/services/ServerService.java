package work.sam.server.services;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import work.sam.server.exception.ServerException;
import work.sam.server.model.Server;
import work.sam.server.repository.ServerRepository;


import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ServerService {

    @Autowired
    private ServerRepository serverRepository;

    public Server findServerByIpAdress(String ipAdress) {
        return serverRepository.findByIpAdress(ipAdress);
    }

//Récupérer tout les serveurs

    public String getAllServers() {
        return getAll().toString();
    }

//Récupérer un serveur
    public Server getServerById(Long id) {
        Optional<Server> server = serverRepository.findById(id);
        if (server.isPresent()) {
            return server.get();
        } else {
            throw new ServerException("Server non trouvé " + id);
        }
    }

    public Server getServerByName(String name) {
        if (serverRepository.findByName(name) == null) {
            throw new ServerException("Name not found");
        } else {
            return serverRepository.findByName(name);
        }
    }

    //read

    public List<Server> getAll() {
        return serverRepository.findAll();
    }


    //Créer un serveur
    public Server createServer(Server server) {
        //Check si l'ip est déjà utilisée
        if (serverRepository.findByIpAdress(server.getIpAdress()) != null) {
            throw new ServerException("L'adresse IP utilisée n'est pas unique");
        }
        return serverRepository.save(server);
    }

    //Supprimer un serveur

     public boolean deleteServerById(Long id) {
         Optional<Server> server = serverRepository.findById(id);
        //Check si IP existante
        if (server.isPresent()) {
            serverRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }
}
