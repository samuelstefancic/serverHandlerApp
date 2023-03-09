import {Server} from "../model/Server";

export interface Response {
  time: Date;
  statusCode: number;
  httpStatus: string;
  reason: string;
  message: string;
  devMessage: string;
  data: { servers?: Server[], server?: Server };
}
