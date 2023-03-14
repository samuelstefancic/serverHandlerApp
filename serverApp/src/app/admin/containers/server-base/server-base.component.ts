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
} from 'rxjs';
import { PopupComponent } from '../../components/popup/popup.component';
import { Component } from '@angular/core';

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

  constructor(private serverService: ServerService) {}

  ngOnInit(): void {
    this.stateApp$ = this.serverService.getServerList().pipe(
      map((response) => {
        this.dataSubject.next(response);
        return {
          dataState: DataState.LOADED,
          appData: {
            ...response,
            data: { servers: response.data?.servers?.reverse() || [] },
          },
        };
      }),
      startWith({
        dataState: DataState.LOADING,
        appData: {
          time: new Date(),
          statusCode: 0,
          httpStatus: '',
          reason: '',
          message: '',
          devMessage: '',
          data: { servers: [] },
        },
      }),
      catchError((error: string) => {
        return of({ dataState: DataState.ERROR, error });
      })
    );
  }

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

  private handleAppState(appState: AppState<Response>): void {
    if (typeof appState.error === 'string') {
      appState.appData = null;
    }
    this.stateApp$ = of(appState);
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
  }

  closePopup() {
    this.isPopupOpen = false;
    this.popUpVisible = false;
  }
}
