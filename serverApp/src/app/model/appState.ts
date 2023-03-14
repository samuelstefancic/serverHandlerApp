import { DataState } from '../enumeration/dataState';

export interface AppState<X> {
  dataState: DataState;
  appData?: X | null | undefined;
  error?: { message: string } | string;
}
