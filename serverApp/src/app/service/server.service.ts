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

  getServerList(): Observable<Response> {
    const url = `${this.apiUrl}/server/list`;
    return this.http.get<Response>(url).pipe(
      catchError((error) => {
        console.error('Error listing the servers', error);
        return throwError(() => new Error(error));
      })
    );
  }

  saveServer(server: Server): Observable<Response> {
    const url = `${this.apiUrl}/server/save`;
    return this.http.post<Response>(url, server).pipe(
      catchError((error) => {
        console.error('Error saving the server', error);
        return throwError(() => new Error(error));
      })
    );
  }

  updateServer(server: Server): Observable<Response> {
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

  deleteServer(serverId: number): Observable<Response> {
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

  /*server$ = <Observable<Response>>(
    this.http
      .get<Response>(`${this.apiUrl}/server/list`)
      .pipe(tap(console.log), catchError(this.handleError))
  );*/

  handleError(error: any): Observable<never> {
    throw new Error('Method not implemented.');
  }
}
