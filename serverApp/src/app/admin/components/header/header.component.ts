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

  constructor(private serverService: ServerService) {}

  ngOnInit(): void {
    this.serverService.serverList$.subscribe((servers: Server[]) => {
      this.serverListGet = servers;
    });
  }

  public filterServer(): void {
    this.serverService.filterServerList(this.selectedStatus as Status);
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
