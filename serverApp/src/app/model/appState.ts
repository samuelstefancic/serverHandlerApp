import {DataState} from "../enumeration/dataState";

export interface AppState<X> {
  dataState: DataState;
  appData: X;
  error: string;
}
