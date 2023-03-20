import { Status } from './../enumeration/status.enum';
import { Response } from './../response/response';
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  Subscriber,
  tap,
  throwError,
} from 'rxjs';
import { Server } from '../model/Server';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private readonly apiUrl: string;
  private serverListSubject = new BehaviorSubject<Server[]>([]);
  public serverList$ = this.serverListSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject('serverIp') private serverIp: 'localhost'
  ) {
    this.apiUrl = `http://${this.serverIp}:8080`;
  }

  setServerList(servers: Server[]): void {
    this.serverListSubject.next(servers);
  }

  filterServerList(status: Status): void {
    const currentList = this.serverListSubject.value;

    const filteredList = currentList.map((server) => {
      server.hidden = status !== Status.ALL && server.status !== status;
      return server;
    });

    this.serverListSubject.next(filteredList);
  }

  //Ping
  ping(ipAdress: string): Observable<Response> {
    const url = `${this.apiUrl}/server/ping/${ipAdress}`;
    return this.http.get<Response>(url).pipe(
      catchError((error) =>
        this.handleError(
          'Error in ping the server with ipAdress ' + ipAdress,
          error
        )
      ),
      map((response: Response) => {
        const server: Server | undefined = response.data['server'];
        if (server) {
          server.status =
            server.status === Status.SERVER_DOWN
              ? Status.SERVER_UP
              : server.status;
        }
        return response;
      })
    );
  }

  //getServerList
  //get

  getServerList(): Observable<Response> {
    const url = `${this.apiUrl}/server/list`;
    return this.http
      .get<Response>(url)
      .pipe(
        catchError((error) =>
          this.handleError('Error while getting the list', error)
        )
      );
  }

  //saveServer

  //post

  saveServer(server: Server): Observable<Response> {
    const url = `${this.apiUrl}/server/save`;
    return this.http.post<Response>(url, server).pipe(
      tap((response) => {
        const addedServer = response.data?.server;
        if (addedServer) {
          const currentList = this.serverListSubject.value;
          this.serverListSubject.next([addedServer, ...currentList]);
        }
      }),
      catchError((error) => this.handleError('Error saving the server', error))
    );
  }

  //Post avec application server

  addNewServer(newServer: Server): Observable<any> {
    return this.saveServer(newServer).pipe(
      tap((response: any) => {
        if (response.success) {
          const updatedServerList = [
            ...this.serverListSubject.value,
            newServer,
          ];
          this.serverListSubject.next(updatedServerList);
        }
      })
    );
  }

  //updateServer
  //put

  updateServer(server: Server): Observable<Response> {
    const url = `${this.apiUrl}/server/${server.id}`;
    return this.http
      .put<Response>(url, server)
      .pipe(
        catchError((error) =>
          this.handleError('Error updating the server', error)
        )
      );
  }

  //deleteServer
  //delete

  deleteServer(serverId: number): Observable<Response> {
    const url = `${this.apiUrl}/server/delete/${serverId}`;
    return this.http.delete<Response>(url).pipe(
      tap(() => {
        const updatedServerList = this.serverListSubject.value.filter(
          (server) => server.id !== serverId
        );
        this.serverListSubject.next(updatedServerList);
      }),
      catchError((error) =>
        this.handleError('Error deleting the server', error)
      )
    );
  }

  //Filtrer

  /*filter$ = (status: Status, response: Response) => <Observable<Response>>
  new Observable<Response>(
    Subscriber => {
      console.log(response);
      Subscriber.next(
        status === Status.ALL ? {...response, message: `server filtered by ${status} status`}
      )
    }
  )*/

  filterServer(status: Status, response: Response): Observable<Response> {
    return new Observable<Response>((subscriber) => {
      if (status === Status.ALL) {
        subscriber.next({
          ...response,
          message: `Servers filtered by ${status} status`,
        });
      } else {
        const filteredServer = response.data.servers?.filter(
          (server) => server.status === status
        );
        if (!filteredServer || filteredServer.length === 0) {
          const errorMessage = `No servers found with status '${status}'`;
          subscriber.error(new Error(errorMessage));
        } else {
          subscriber.next({
            ...response,
            data: { servers: filteredServer },
            message: `Servers filtered by ${status} status`,
          });
        }
      }
    }).pipe(
      catchError((error: HttpErrorResponse) =>
        this.handleError(`Error while filtering servers`, error)
      )
    );
  }

  //this one is taking the server object

  deleteServerObject(server: Server): Observable<Response> {
    const url = `${this.apiUrl}/server/delete/${server.id}`;
    return this.http.delete<Response>(url).pipe(
      catchError((error) => {
        console.error('Error updating the server with id ' + server.id, error);
        return throwError(() => new Error(error));
      })
    );
  }

  //ping

  pingNonUsed(ipAdress: string): Observable<Response> {
    const url = `${this.apiUrl}/server/ping/${ipAdress}`;
    return this.http.get<Response>(url).pipe(
      catchError((error) => {
        console.error(
          'Error in ping the server with ipAdress ' + ipAdress,
          error
        );
        return throwError(() => new Error(error));
      })
    );
  }

  private handleError(
    errorMessage: string,
    errorHttp: HttpErrorResponse
  ): Observable<never> {
    console.error(errorMessage, errorHttp);
    const err =
      errorHttp.error instanceof ErrorEvent
        ? errorHttp.error.message
        : `Error Code: ${errorHttp.status}\nMessage: ${errorHttp.message}`;
    return throwError(() => new Error(err));
  }
}

/*//Sans méthode catchError, plus lourd
  getServerListNonUsed(): Observable<Response> {
    const url = `${this.apiUrl}/server/list`;
    return this.http.get<Response>(url).pipe(
      catchError((error) => {
        console.error('Error listing the servers', error);
        return throwError(() => new Error(error));
      })
    );
  }

  saveServerNonUsed(server: Server): Observable<Response> {
    const url = `${this.apiUrl}/server/save`;
    return this.http.post<Response>(url, server).pipe(
      catchError((error) => {
        console.error('Error saving the server', error);
        return throwError(() => new Error(error));
      })
    );
  }

  updateServerNonUsed(server: Server): Observable<Response> {
    const url = `${this.apiUrl}/server/${server.id}`;
    return this.http.put<Response>(url, server).pipe(
      catchError((error) => {
        console.error('Error updating the server with id ' + server.id, error);
        return throwError(() => new Error(error));
      })
    );
  }

  //delete methods

  //This one is taking the serverId

  deleteServerNonUsed(serverId: number): Observable<Response> {
    const url = `${this.apiUrl}/server/delete/${serverId}`;
    return this.http.delete<Response>(url).pipe(
      catchError((error) => {
        console.error('Error updating the server with id ' + serverId, error);
        return throwError(() => new Error(error));
      })
    );
  } */
