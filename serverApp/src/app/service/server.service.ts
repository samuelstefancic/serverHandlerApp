import { Response } from './../response/response';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Response } from '../response/response';
import { Server } from '../model/Server';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject('serverIp') private serverIp: string
  ) {
    this.apiUrl = `http://${this.serverIp}:8080`;
  }

  //Avec méthode handleError, plus léger

  //Ping
  ping(ipAdress: string): Observable<Response> {
    const url = `${this.apiUrl}/server/ping/${ipAdress}`;
    return this.http
      .get<Response>(url)
      .pipe(
        catchError((error) =>
          this.handleError(
            'Error in ping the server with ipAdress ' + ipAdress,
            error
          )
        )
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
    return this.http
      .post<Response>(url, server)
      .pipe(
        catchError((error) =>
          this.handleError('Error saving the server', error)
        )
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
    const url = `${this.apiUrl}/server/${serverId}`;
    return this.http
      .delete<Response>(url)
      .pipe(
        catchError((error) =>
          this.handleError('Error deleting the server', error)
        )
      );
  }

  //Sans méthode catchError, plus lourd
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

  private handleError(errorMessage: string, error: any): Observable<never> {
    console.error(errorMessage, error);
    return throwError(() => new Error(error));
  }
}
