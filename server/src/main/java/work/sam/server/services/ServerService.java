package work.sam.server.services;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import work.sam.server.enumeration.Status;
import work.sam.server.exception.ServerException;
import work.sam.server.model.Server;
import work.sam.server.repository.ServerRepository;


import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.URL;
import java.net.UnknownHostException;
import java.time.LocalDate;
import java.time.LocalDateTime;
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

    //save method
    public Server save(Server server) {
        if (server.getStatus() == null) {
            server.setStatus(Status.SERVER_DOWN);
        }
        server.setImageUrl(setServerImageUrl());
        return serverRepository.save(server);
    }

//Récupération de serveurs par informations

    public Server findServerByIpAdress(String ipAdress) {
        return serverRepository.findByIpAdress(ipAdress);
    }

    public Server getServerById(Long id) {
        Optional<Server> server = serverRepository.findById(id);
        if (server.isPresent()) {
            return server.get();
        } else {
            throw new ServerException("Server non trouvé " + id, HttpStatus.BAD_REQUEST);
        }
    }

    public Server getServerByName(String name) {
        if (serverRepository.findByName(name) == null) {
            throw new ServerException("Name not found", HttpStatus.BAD_REQUEST);
        } else {
            return serverRepository.findByName(name);
        }
    }

    public Server getServerByIp(String ipAdress) {
        if (serverRepository.findByIpAdress(ipAdress) == null) {
            throw new ServerException("Server not found with ip adress", HttpStatus.NOT_FOUND);
        } else {
            return serverRepository.findByIpAdress(ipAdress);
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
            throw new ServerException("L'adresse IP utilisée n'est pas unique", HttpStatus.BAD_REQUEST);
        }
        return serverRepository.save(server);
    }

    public Server create(Server server) {
        logger.info("Sauvegarde du nouveau serveur ... {} ", server.getName());
        if (server.getStatus() == null) {
            server.setStatus(Status.SERVER_DOWN);
        }
        server.setLastPing(LocalDateTime.now());
        server.setImageUrl(setServerImageUrl());
        return serverRepository.save(server);
    }

    //Supprimer un serveur

    public void deleteServerById(Long id) {
        Optional<Server> server = serverRepository.findById(id);
        //Check si IP existante
        if (server.isPresent()) {
            serverRepository.deleteById(id);
            logger.info("Server with ID {} has been deleted ", id);
        } else {
            throw new ServerException("This server does not exist", HttpStatus.NO_CONTENT);
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
            existServer.setLastPing(LocalDateTime.now());
            return serverRepository.save(existServer);
        } else {
            throw new ServerException("Server not found with id : " + id, HttpStatus.BAD_REQUEST);
        }
    }

    //Autres méthodes


    //Fetch images
    public byte[] fetchImage(Long id) throws IOException {
        Server server = this.getServerById(id);
        return new ClassPathResource(server.getImageUrl()).getContentAsByteArray();
    }

    public Server ping(String ipAdress) {
        logger.info("Ping vers ip du serveur : ", ipAdress);
        Server server = serverRepository.findByIpAdress(ipAdress);
        if (server == null) {
            throw new ServerException("Server not found with ip : " + ipAdress, HttpStatus.BAD_REQUEST);
        }
        try {
            InetAddress addr = InetAddress.getByName(ipAdress);
            if (addr.isReachable(1000)) {
                server.setStatus(Status.SERVER_UP);
                serverRepository.save(server);
            } else {
                server.setStatus(Status.SERVER_DOWN);
            }
        } catch (UnknownHostException e) {
            logger.error("L'adresse IP fournie est invalide : ", ipAdress);
            server.setStatus(Status.SERVER_DOWN);
            throw new ServerException("Adresse IP invalide " + ipAdress, HttpStatus.BAD_REQUEST);

        } catch (IOException e) {
            logger.error("Le serveur n'est pas joignable, ip : ", ipAdress);
            server.setStatus(Status.SERVER_DOWN);
            throw new ServerException("Server is not responding to pings" + ipAdress, HttpStatus.SERVICE_UNAVAILABLE);
        }
        server.setLastPing(LocalDateTime.now());
        serverRepository.save(server);
        return server;
    }
    public Server pingId(Long id) {
        logger.info("Ping vers id du serveur : ", id);
        Server server = serverRepository.findFirstById(id);
        if (server == null) {
            throw new ServerException("Server not found with ip : " + id, HttpStatus.BAD_REQUEST);
        }
        try {
            InetAddress addr = InetAddress.getByName(server.getIpAdress());
            if (addr.isReachable(1000)) {
                server.setStatus(Status.SERVER_UP);
            } else {
                server.setStatus(Status.SERVER_DOWN);
            }
        } catch (UnknownHostException e) {
            logger.error("L'adresse IP fournie est invalide : ", server.getIpAdress());
            server.setStatus(Status.SERVER_DOWN);
            throw new ServerException("Adresse IP invalide " + server.getIpAdress(), HttpStatus.BAD_REQUEST);

        } catch (IOException e) {
            logger.error("Le serveur n'est pas joignable, ip : ", server.getIpAdress());
            server.setStatus(Status.SERVER_DOWN);
            throw new ServerException("Server is not responding to pings" + server.getIpAdress(), HttpStatus.SERVICE_UNAVAILABLE);
        }
        server.setLastPing(LocalDateTime.now());
        serverRepository.save(server);
        return server;
    }
    private LocalDateTime getLastPing(Server server) {
        return server.getLastPing();
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
    public List<Server>  list(int limit) {
        logger.info("Getting " + limit + " servers");
        return serverRepository.findAll(PageRequest.of(0, limit)).getContent();
    }
    //Meilleure méthode pour gérer les pages, donc efficace dans cet exemple
    public Page<Server> getEveryServer(Pageable pageable) {
        return serverRepository.findAll(pageable);
    }
    private void checkServerIsNotNull(Server server) {
        if (server == null) {
            throw new ServerException("Serveur null", HttpStatus.BAD_REQUEST);
        }
    }

    private String setServerImageUrl() {
        String imagesNames[] = {"serveur1.png", "serveur2.png", "serveur3.png", "serveur4.png", "serveur5.png"};
        try {
            return ServletUriComponentsBuilder.fromCurrentContextPath().path("/server/image/" + imagesNames[new Random().nextInt(5)]).toUriString();
        } catch (Exception e) {
            logger.info("Image not load" + e);
            return "Image could not be loaded";
        }
    }

    //méthode utilisant un math.random, je doute que cela soit opti sur le long terme
    private String setServerImageUrlRandom() {
        String imagesNames[] = {"serveur1.png", "serveur2.png", "serveur3.png", "serveur4.png", "serveur5.png"};
        int randomIndex = (int) (Math.random() * imagesNames.length);
        return getClass().getResource(imagesNames[randomIndex]).toString();
    }
    public void createExampleServers() {
        logger.info("Creating example servers...");

        Server server1 = new Server("192.168.1.1", "Server 1", "16", "Test", null, Status.SERVER_UP, LocalDateTime.now());
        serverRepository.save(server1);

        Server server2 = new Server("192.168.1.2", "Server 2", "32", "Test", null, Status.SERVER_DOWN, LocalDateTime.now());
        serverRepository.save(server2);

        Server server3 = new Server("192.168.1.3", "Server 3", "64", "Prod", null, Status.SERVER_UP, LocalDateTime.now());
        serverRepository.save(server3);

        logger.info("Example servers created successfully.");
    }

}
