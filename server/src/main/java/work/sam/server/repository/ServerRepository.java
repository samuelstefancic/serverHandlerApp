package work.sam.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import work.sam.server.model.Server;

import java.util.Optional;

public interface ServerRepository extends JpaRepository<Server, Long> {

    Server findByIpAdress(String ipAdress);

    @Override
    Optional<Server> findById(Long id);

}
