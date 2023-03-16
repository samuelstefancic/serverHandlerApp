import { Server } from './../../../model/Server';
import { ServerService } from './../../../service/server.service';
import { Status } from './../../../enumeration/status.enum';
import { DataState } from './../../../enumeration/dataState';
import { AppState } from './../../../model/appState';
import { Response } from './../../../response/response';
import {
  BehaviorSubject,
  Observable,
  startWith,
  catchError,
  of,
  map,
  tap,
  merge,
  switchMap,
  throwError,
} from 'rxjs';
import { PopupComponent } from '../../components/popup/popup.component';
import { Component, Injector } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-server-base',
  templateUrl: './server-base.component.html',
  styleUrls: ['./server-base.component.css'],
})
export class ServerBaseComponent {
  public stateApp$: Observable<AppState<Response>> | undefined;
  public static readonly DataState = DataState;
  public static readonly Status = Status;
  public filterStatus$?: Observable<string>;
  public isLoading$?: Observable<boolean>;

  private subjectFilter = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<Response | null>(null);
  private isLoading = new BehaviorSubject<boolean>(false);
  private _isPopupOpen: boolean = false;
  private _popUpVisible: boolean = false;

  public serverList: Server[] = [];
  public headerComponent = HeaderComponent;

  serverListGet: Server[] = [];
  successMessage = '';

  public selectedServer: Server | null = null;

  constructor(
    private serverService: ServerService,
    private injector: Injector
  ) {}

  ngOnInit(): void {
    this.serverService.getServerList().subscribe((response: any) => {
      this.serverList = response.data.servers;
      this.serverService.setServerList(this.serverList);
    });
  }

  //Actual methods who are working

  addNewServer(newServer: Partial<Server>) {
    const addedServ: Server = {
      id: 0,
      ipAdress: newServer.ipAdress || '',
      name: newServer.name || '',
      memory: newServer.memory || '',
      type: newServer.type || '',
      imageUrl: '',
      status: newServer.status || Status.SERVER_UP,
      hidden: newServer.hidden || false,
    };
    this.serverService.saveServer(addedServ).subscribe({
      next: (response) => {},
      error: (error) => {
        console.error('Error adding the server:', error);
      },
    });
  }

  //Mainly to practice, i went through hell to be honest

  public deleteServer(serverId: number): void {
    this.serverService
      .deleteServer(serverId)
      .pipe(
        map((response: Response) => {
          const filteredServers = this.dataSubject.value?.data.servers?.filter(
            (server) => server.id !== serverId
          );
          return {
            dataState: DataState.LOADED,
            appData: {
              time: new Date(),
              statusCode: response.statusCode,
              httpStatus: response.httpStatus,
              reason: response.reason,
              message: response.message,
              devMessage: response.devMessage,
              data: { servers: filteredServers?.reverse() },
            },
          };
        }),
        catchError((error: string) => {
          return of({
            dataState: DataState.ERROR,
            error: error,
          });
        })
      )
      .subscribe((appState: AppState<Response>) => {
        this.stateApp$ = of(appState);
      });
  }

  //Filter
  public filterServer(status: Status): void {
    switch (status) {
      case Status.ALL:
        this.serverList.forEach((server) => {
          server.hidden = false;
        });
        break;
      case Status.SERVER_UP:
        this.serverList.forEach((server) => {
          server.hidden = server.status !== Status.SERVER_UP;
        });
        break;
      case Status.SERVER_DOWN:
        this.serverList.forEach((server) => {
          server.hidden = server.status !== Status.SERVER_DOWN;
        });
        break;
    }
  }
  //Save
  public saveServer(server: Server): void {
    const saveServer$ = this.serverService.saveServer(server);
    const updateData$ = saveServer$.pipe(
      map((response: Response) => {
        const newServer = response.data.server;
        const oldServers = this.dataSubject.value?.data.servers ?? [];
        const servers = [...oldServers, newServer].filter(
          (server: Server | undefined): server is Server => server !== undefined
        );
        const newData = { ...response.data, servers };
        return { ...response, data: newData };
      }),
      tap((response: Response) => {
        this.dataSubject.next(response);
      })
    );
    const stateApp$ = merge(
      this.updateData(updateData$),
      of({ dataState: DataState.LOADING, appData: this.dataSubject.value })
    );
    stateApp$.subscribe((appState: AppState<Response>) => {
      this.handleAppState(appState);
    });
  }

  private updateData(
    saveServer$: Observable<Response>
  ): Observable<AppState<Response>> {
    return saveServer$.pipe(
      map((response: Response) => {
        const newServer = response.data.server;
        const oldServers = this.dataSubject.value?.data.servers ?? [];
        const servers = [...oldServers, newServer].filter(
          (server: Server | undefined): server is Server => server !== undefined
        );
        const newData = { ...response.data, servers };
        return { ...response, data: newData };
      }),
      map(() => ({
        dataState: DataState.LOADED,
        appData: this.dataSubject.value,
      })),
      catchError((error: string) => {
        return of({
          dataState: DataState.ERROR,
          error: { message: error },
        });
      })
    );
  }

  onUpdateServer(updatedServer: Partial<Server>) {
    if (this.selectedServer) {
      const updatedServerData: Server = {
        ...this.selectedServer,
        ...updatedServer,
      };
      this.serverService.updateServer(updatedServerData).subscribe({
        next: (response) => {
          const serverIndex = this.serverList.findIndex(
            (server) => server.id === updatedServerData.id
          );
          if (serverIndex > -1) {
            this.serverList[serverIndex] = updatedServerData;
          }
          this.closeUpdatePopup();
        },
        error: (error) => {
          console.error('Error updating the server:', error);
        },
      });
    }
  }

  private handleAppState(appState: AppState<Response>): void {
    if (typeof appState.error === 'string') {
      appState.appData = null;
    }
    this.stateApp$ = of(appState);
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

  //PopUp

  public get isPopupOpen(): boolean {
    return this._isPopupOpen;
  }

  public set isPopupOpen(value: boolean) {
    this._isPopupOpen = value;
  }

  public get popUpVisible(): boolean {
    return this._popUpVisible;
  }

  public set popUpVisible(value: boolean) {
    this._popUpVisible = value;
  }

  openPopup() {
    this.isPopupOpen = true;
    this.popUpVisible = true;
    this._isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
    this.popUpVisible = false;
    this._isPopupOpen = false;
  }

  onBackgroundClick() {
    this.closePopup();
  }

  public openUpdatePopup(server: Server) {
    this.selectedServer = server;
    this.isPopupOpen = true;
  }

  public closeUpdatePopup(): void {
    this.selectedServer = null;
    this.isPopupOpen = false;
  }
}
