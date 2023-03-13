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
} from 'rxjs';
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
}
