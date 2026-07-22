export type Role = 'OFFICER' | 'MANAGER' | 'GENERAL_MANAGER';

export interface AuthState {
  role: Role;
  factoryId: string;
  factoryIds: string[];
  displayName: string;
}

export interface SensorReading {
  timestamp: string;
  deviceId: string | null;
  factoryId: string | null;
  batchId: string | null;
  temperature: number | null;
  humidity: number | null;
  rgRatio: number | null;
  mq137: number | null;
  tgs2620: number | null;
  tgs822: number | null;
}

export interface GraphPoint {
  timestamp: string;
  value: number;
}

export interface BatchGraphs {
  temperature: GraphPoint[];
  humidity: GraphPoint[];
  rgRatio: GraphPoint[];
  mq137: GraphPoint[];
  tgs2620: GraphPoint[];
  tgs822: GraphPoint[];
}

export interface BatchSummary {
  batchId: string;
  factoryId: string;
  glp: number | null;
  price: number | null;
  summaryKey?: string;
  type?: string;
}

export interface BatchListItem {
  batchId: string;
  lastTimestamp: string | null;
  latestTemperature: number | null;
  latestHumidity: number | null;
  latestRgRatio: number | null;
  latestMq137: number | null;
  latestTgs2620: number | null;
  latestTgs822: number | null;
  glp: number | null;
  price: number | null;
}

export interface PricedBatchSummary {
  batchId: string;
  factoryId?: string;
  price: number;
  glp: number | null;
}

export interface FactoryDashboard {
  factoryId?: string;
  totalBatches?: number;
  latestReadings?: SensorReading[];
  highestPriceBatch: PricedBatchSummary | null;
  lowestPriceBatch: PricedBatchSummary | null;
}

export interface FactorySummary {
  factoryId: string;
  totalBatches: number;
  pricedBatches: number;
  totalRevenue: number;
  topBatch: PricedBatchSummary | null;
}

export interface GeneralSummary {
  totalFactories: number;
  totalRevenue: number;
  topFactory: string | null;
  topBatch: PricedBatchSummary | null;
  factoryContributionPercentages: Record<string, number>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
