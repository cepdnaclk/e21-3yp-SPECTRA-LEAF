export type Role = 'OFFICER';

export interface AuthState {
  role: Role | null;
  factoryId: string;
  displayName: string;
}

export interface SensorReading {
  timestamp: string;
  deviceId: string;
  factoryId: string;
  batchId: string;
  temperature: number | null;
  humidity: number | null;
  rgRatio: number | null;
  mq137: number | null;
  tgs2620: number | null;
  tgs822: number | null;
}

export interface BatchListItem {
  batchId: string;
  lastTimestamp: string;
  latestTemperature: number | null;
  latestHumidity: number | null;
  latestRgRatio: number | null;
  latestMq137: number | null;
  latestTgs2620: number | null;
  latestTgs822: number | null;
  glp: number | null;
  price: number | null;
}

export interface BatchSummary {
  batchId: string;
  factoryId: string;
  glp: number | null;
  price: number | null;
}

export interface GraphPoint {
  timestamp: string;
  value: number;
}

export interface BatchGraphs {
  batchId: string;
  temperature: GraphPoint[];
  humidity: GraphPoint[];
  rgRatio: GraphPoint[];
  mq137: GraphPoint[];
  tgs2620: GraphPoint[];
  tgs822: GraphPoint[];
}

export interface FermentationState {
  factoryId: string;
  status: 'RUNNING' | 'STOPPED';
  batchId: string | null;
  deviceId: string | null;
  startedAt: string | null;
  updatedAt: string | null;
}

export interface OfficerProfile {
  displayName: string;
  email: string;
  phone: string;
  shift: string;
  factoryId: string;
  role: Role;
}
