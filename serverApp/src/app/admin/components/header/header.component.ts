import { ServerService } from './../../../service/server.service';
import { Component, NgModule, EventEmitter, Output } from '@angular/core';
import { Status } from './../../../enumeration/status.enum';
import { Response } from './../../../response/response';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServerBaseComponent } from '../../containers/server-base/server-base.component';
import { Server } from 'src/app/model/Server';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  public statusOptions = Object.values(Status);
  public Status = Status;
  public selectedStatus = Status.ALL;
  public serverList?: Response;
  public serverBase = ServerBaseComponent;
  @Output() filterChanged = new EventEmitter<Status>();
  serverListGet: Server[] = [];
  serverPopupOpen = false;
  successMessage = '';

  constructor(private serverService: ServerService) {}

  ngOnInit(): void {
    this.serverService.serverList$.subscribe((servers: Server[]) => {
      this.serverListGet = servers;
    });
  }

  public filterServer(): void {
    this.serverService.filterServerList(this.selectedStatus as Status);
  }

  createNewServer(): Partial<Server> {
    return {
      id: 0,
      ipAdress: '',
      name: '',
      memory: '',
      type: '',
      imageUrl: '',
      status: Status.SERVER_UP,
      hidden: false,
    };
  }

  onAddNewServer(newServer: Partial<Server>) {
    this.serverService.addNewServer(newServer as Server).subscribe(() => {
      // Handle the successful addition of the server, e.g., refresh the list, show a message, etc.
      this.refreshServerList();
      this.showSuccessMessage('Server added successfully!');
    });
  }

  onUpdateServer(updatedServer: Partial<Server>) {
    this.serverService.updateServer(updatedServer as Server).subscribe(() => {
      // Handle the successful update of the server, e.g., refresh the list, show a message, etc.
      this.refreshServerList();
      this.showSuccessMessage('Server updated successfully!');
    });
  }

  onDeleteServer(serverId: number) {
    this.serverService.deleteServer(serverId).subscribe(() => {
      // Handle the successful deletion of the server, e.g., refresh the list, show a message, etc.
      this.refreshServerList();
      this.showSuccessMessage('Server deleted successfully!');
    });
  }

  refreshServerList() {
    this.serverService.getServerList().subscribe((response: Response) => {
      if (response.data && response.data.servers) {
        this.serverListGet = response.data.servers;
      }
    });
  }

  showSuccessMessage(message: string) {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
  //Ancienne version du filtre
  public oldfilterServer(): void {
    if (
      this.serverList &&
      this.serverList.data &&
      this.serverList.data.servers
    ) {
      const filteredServers = this.serverList.data.servers.filter((server) => {
        switch (this.selectedStatus) {
          case Status.ALL:
            return true;
          case Status.SERVER_UP:
            return server.status === Status.SERVER_UP;
          case Status.SERVER_DOWN:
            return server.status === Status.SERVER_DOWN;
          default:
            return true;
        }
      });
      filteredServers.forEach((server) => {
        server.hidden = false;
      });
      const hiddenServers = this.serverList.data.servers.filter(
        (server) => !filteredServers.includes(server)
      );
      hiddenServers.forEach((server) => {
        server.hidden = true;
      });
    }
  }

  public onFilterChange(): void {
    this.filterChanged.emit(this.selectedStatus as Status);
  }
}
