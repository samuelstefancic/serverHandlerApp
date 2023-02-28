package work.sam.server.services;
import jakarta.servlet.Servlet;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import work.sam.server.enumeration.Status;
import work.sam.server.exception.ServerException;
import work.sam.server.model.Server;
import work.sam.server.repository.ServerRepository;


import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import static org.springframework.data.domain.PageRequest.of;


@Service
@Transactional
public class ServerService {

    @Autowired
    private ServerRepository serverRepository;

    private static final Logger logger = LoggerFactory.getLogger(ServerService.class);







//Récupération de serveurs par informations

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


    //Update
    public Server updateServer(Long id, Server updatedServer) {
        Optional<Server> server = serverRepository.findById(id);
        if (server.isPresent()) {
            Server existServer = server.get();
            existServer.setName(updatedServer.getName());
            existServer.setIpAdress(updatedServer.getIpAdress());
            existServer.setImageUrl(updatedServer.getImageUrl());
            existServer.setMemory(updatedServer.getMemory());
            existServer.setType(updatedServer.getType());
            existServer.setStatus(updatedServer.getStatus());
            return serverRepository.save(existServer);
        } else {
            throw new ServerException("Server not found with id : " + id);
        }
    }

    //Autres méthodes


    public Server create(Server server) {
        logger.info("Sauvegarde du nouveau serveur ... {} ", server.getName());
        server.setImageUrl(setServerImageUrl());
        return serverRepository.save(server);
    }

    public Server ping(String ipAdress) {
        logger.info("Ping vers ip du serveur : ", ipAdress);
        Server server = serverRepository.findByIpAdress(ipAdress);

        try {
            InetAddress addr = InetAddress.getByName(ipAdress);
            if (addr.isReachable(1000)) {
                server.setStatus(Status.SERVER_UP);
            } else {
                server.setStatus(Status.SERVER_DOWN);
            }
        } catch (UnknownHostException e) {
            logger.error("L'adresse IP fournie est invalide : ", ipAdress);
            server.setStatus(Status.SERVER_DOWN);
        } catch (IOException e) {
            logger.error("Le serveur n'est pas joignable, ip : ", ipAdress);
            server.setStatus(Status.SERVER_DOWN);
        }
        return server;
    }

    //Récupérer tout les serveurs

    public String getAllServers() {
        return getAll().toString();
    }

    //Plusieurs méthodes pour récupérer le code

    //Même chose que getEveryServer mais plus compliquée à gére
    public Collection<Server>  liste(int limit) {
        logger.info("Getting every servers");
        return serverRepository.findAll(of(0, limit)).toList();
    }
    //Retourne tout les serveurs sans se soucier de la pagination
    public Collection<Server>  list(int limit) {
        logger.info("Getting every servers");
        return serverRepository.findAll();
    }
    //Meilleure méthode pour gérer les pages, donc efficace dans cet exemple
    public Page<Server> getEveryServer(Pageable pageable) {
        return serverRepository.findAll(pageable);
    }


    private void checkServerIsNotNull(Server server) {
        if (server == null) {
            throw new ServerException("Serveur null");
        }
    }

    private String setServerImageUrl() {
        String imagesNames[] = {"serveur1.png", "serveur2.png", "serveur3.png", "serveur4.png", "serveur5.png"};
        return ServletUriComponentsBuilder.fromCurrentContextPath().path("/server/src/images/" + imagesNames[new Random().nextInt(5)]).toUriString();
    }

    //méthode utilisant un math.random, je doute que cela soit opti sur le long terme
    private String setServerImageUrlRandom() {
        String imagesNames[] = {"serveur1.png", "serveur2.png", "serveur3.png", "serveur4.png", "serveur5.png"};
        int randomIndex = (int) (Math.random() * imagesNames.length);
        return getClass().getResource(imagesNames[randomIndex]).toString();
    }

}
