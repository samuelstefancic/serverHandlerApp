import {Status} from "../enumeration/status.enum";

export interface Server {
  id: number;
  ipAdress: string;
  name: string;
  memory: string;
  type: string;
  imageUrl: string;
  status: Status;
}
