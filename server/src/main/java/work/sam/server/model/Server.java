package work.sam.server.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import work.sam.server.enumeration.Status;

import java.util.Objects;

@Entity
@Table(name = "SERVERS")
@NoArgsConstructor
@AllArgsConstructor
public class Server {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "generateur_serveur")
    @SequenceGenerator(name="generateur_serveur",
            sequenceName = "sequence_serv", initialValue = 15, allocationSize = 1)
    private Long id;
    @Column(name="IpAdresse", nullable = false, unique = true)
    @NotEmpty(message = "L'adresse IP ne peut être nulle")
    private String ipAdress;
    @NotEmpty(message = "Le nom du serveur doit être renseigné")
    @Column(name="Name")
    private String name;
    @Column(name = "Memory")
    private String memory;
    @Column(name = "Type")
    private String type;
    @Column(name = "ImageUrl")
    private String imageUrl;
    @Column(name = "status")
    private Status status;


    public Long getId() {
        return id;
    }

    public String getIpAdress() {
        return ipAdress;
    }

    public String getName() {
        return name;
    }

    public String getMemory() {
        return memory;
    }

    public String getType() {
        return type;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Status getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setIpAdress(String ipAdress) {
        this.ipAdress = ipAdress;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setMemory(String memory) {
        this.memory = memory;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Server server = (Server) o;
        return id.equals(server.id) && ipAdress.equals(server.ipAdress) && Objects.equals(name, server.name) && Objects.equals(memory, server.memory) && Objects.equals(type, server.type) && Objects.equals(imageUrl, server.imageUrl) && status == server.status;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, ipAdress, name, memory, type, imageUrl, status);
    }

    @Override
    public String toString() {
        return "Server{" +
                "id=" + id +
                ", ipAdress='" + ipAdress + '\'' +
                ", name='" + name + '\'' +
                ", memory='" + memory + '\'' +
                ", type='" + type + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", status=" + status +
                '}';
    }
}
