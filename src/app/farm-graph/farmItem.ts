 export interface FarmItem {
  acceptable?: any;
  border?: any;
  textColor: string;
  color: string;
  zIndex: number;
  formData: FormData;
  guid: number;
  id: number;
  name: string;
  order: number;
  pageTemplate: string;
  position: Position;
  getX: number;
  getY: number;
  getW: number;
  getH: number;
  resizable: boolean;
  radius: boolean;
  status: boolean;
  type: number;
  positionIsUpdated: boolean;
  routableItems: RoutableItem[];
  routingEnabled: RoutingEnabled;
  isConnected: boolean;
  routingIsEnable: boolean;
  routings: Routing[];
  routingType: RoutingType;
}

interface RoutingType {
  id: number;
  type: string;
}

interface Routing {
  id: string;
  from: number;
  to: To;
  gate: string;
  isDefault: boolean;
  isDeleted: boolean;
}

interface To {
  id: number;
  name: string;
}

interface RoutingEnabled {
  input: boolean;
  output: boolean;
  ignoredTypes: any[];
}

interface RoutableItem {
  deviceTypeId: number;
  input: boolean;
  output: boolean;
  ignoredTypes: number[];
}

interface Position {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface FormData {
  NodeName: string;
  NodeId: number;
  DeviceTypeId: number;
  LocationId: number;
  DeviceUrl: string;
  Cubicle?: any;
}