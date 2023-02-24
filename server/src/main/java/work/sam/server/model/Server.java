package work.sam.server.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import work.sam.server.enumeration.Status;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Server {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "generateur_serveur")
    @SequenceGenerator(name="generateur_serveur",
            sequenceName = "sequence_serv", initialValue = 15, allocationSize = 1)
    private Long id;
    @Column(unique = true)
    @NotEmpty(message = "L'adresse IP ne peut être nulle")
    private String ipAdress;
    @NotEmpty(message = "Le nom du serveur doit être renseigné")
    private String name;
    private String memory;
    private String type;
    private String imageUrl;
    private Status status;

}
