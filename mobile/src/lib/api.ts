import axios from 'axios';
import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';
import { BatchGraphs, BatchListItem, BatchSummary, GraphPoint, SensorReading } from '../types';

function originFromUrl(value?: string | null) {
  if (!value) return null;
  const match = value.match(/^(https?):\/\/([^/]+)/);
  return match ? `${match[1]}://${match[2]}` : null;
}

function originFromHost(value?: string | null) {
  if (!value) return null;
  const host = value.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const protocol = host.includes('exp.direct') ? 'https' : 'http';
  return `${protocol}://${host}`;
}

const BACKEND_PORT = 5000;

function backendOriginFromHost(value?: string | null) {
  if (!value) return null;
  const stripped = value.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const hostOnly = stripped.split(':')[0];
  if (!hostOnly) return null;
  // Only auto-derive backend URL when expo is running on LAN (an IP address).
  // For tunnel hosts (exp.direct, ngrok, etc.) we can't guess the backend URL.
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostOnly);
  const isLoopback = hostOnly === '127.0.0.1' || hostOnly === '0.0.0.0';
  if (!isIp || isLoopback) return null;
  return `http://${hostOnly}:${BACKEND_PORT}`;
}

function getExpoLanHost(): string | null {
  const constants = Constants as any;
  return (
    constants.manifest2?.extra?.expoClient?.hostUri ||
    constants.manifest2?.extra?.expoGo?.debuggerHost ||
    constants.expoConfig?.hostUri ||
    constants.manifest?.hostUri ||
    constants.manifest?.debuggerHost ||
    null
  );
}

function getNativeDevServerOrigin() {
  const scriptURL = (NativeModules as any).SourceCode?.scriptURL as string | undefined;
  if (!scriptURL) return null;

  return originFromUrl(scriptURL);
}

function getExpoManifestOrigin() {
  const constants = Constants as any;
  const manifest2 = constants.manifest2;
  const manifest = constants.manifest;
  const expoConfig = constants.expoConfig;

  return (
    originFromUrl(manifest2?.launchAsset?.url) ||
    originFromHost(manifest2?.extra?.expoClient?.hostUri) ||
    originFromHost(manifest2?.extra?.expoGo?.debuggerHost) ||
    originFromHost(expoConfig?.hostUri) ||
    originFromHost(manifest?.hostUri) ||
    originFromHost(manifest?.debuggerHost) ||
    null
  );
}

export function normalizeApiBaseURL(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error('Server address must start with http:// or https://');
  }
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

export function getDefaultApiBaseURL() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }

  const constants = Constants as any;
  const configuredBaseURL =
    constants.expoConfig?.extra?.apiBaseUrl ||
    constants.manifest2?.extra?.expoClient?.extra?.apiBaseUrl ||
    constants.manifest?.extra?.apiBaseUrl ||
    process.env.EXPO_PUBLIC_API_BASE_URL;

  if (configuredBaseURL) {
    return normalizeApiBaseURL(configuredBaseURL);
  }

  const lanHost = getExpoLanHost();
  const lanBackend = backendOriginFromHost(lanHost);
  if (lanBackend) {
    return `${lanBackend}/api`;
  }

  const nativeOrigin = getExpoManifestOrigin() || getNativeDevServerOrigin();
  if (nativeOrigin && Platform.OS === 'web') {
    return `${nativeOrigin}/api`;
  }

  return Platform.OS === 'android'
    ? `http://10.0.2.2:${BACKEND_PORT}/api`
    : `http://localhost:${BACKEND_PORT}/api`;
}

export const api = axios.create({
  baseURL: getDefaultApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

console.log('[API baseURL]', api.defaults.baseURL);

api.interceptors.response.use(
  response => response,
  error => {
    console.log('[API error]', error.config?.url, error.response?.data ?? error.message);
    if (error.message === 'Network Error') {
      error.message = `Cannot reach database server at ${error.config?.baseURL ?? api.defaults.baseURL}`;
    }
    return Promise.reject(error);
  }
);

export function configureApiBaseURL(value: string) {
  api.defaults.baseURL = normalizeApiBaseURL(value);
}

export async function verifyDatabaseConnection(baseURL: string, factoryId: string) {
  const normalized = normalizeApiBaseURL(baseURL);
  const client = axios.create({ baseURL: normalized, timeout: 15000 });
  const [healthResponse, batchesResponse] = await Promise.all([
    client.get('/health'),
    client.get(`/factories/${factoryId}/batches`),
  ]);
  const batches = getArrayPayload<unknown>(batchesResponse.data, 'batches');
  return {
    baseURL: normalized,
    batchCount: batches.length,
    table: healthResponse.data?.data?.table ?? 'FermentationData',
    region: healthResponse.data?.data?.region ?? 'unknown',
  };
}

export function unwrap<T>(payload: any): T {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
}

export function getArrayPayload<T>(payload: unknown, key?: string): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (key && Array.isArray(record[key])) return record[key] as T[];
    if (Array.isArray(record.data)) return record.data as T[];
  }
  return [];
}

export function getObjectPayload<T>(payload: unknown, fallback: T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return ((payload as { data?: T }).data ?? fallback) as T;
  }
  return (payload as T) ?? fallback;
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function stringOrEmpty(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

export function normalizeReading(raw: any): SensorReading {
  return {
    timestamp: stringOrEmpty(raw?.timestamp ?? raw?.TIMESTAMP),
    deviceId: stringOrEmpty(raw?.deviceId ?? raw?.DEVICE_ID),
    factoryId: stringOrEmpty(raw?.factoryId ?? raw?.FACTORY_ID),
    batchId: stringOrEmpty(raw?.batchId ?? raw?.BATCH_ID),
    temperature: numberOrNull(raw?.temperature ?? raw?.TEMPERATURE),
    humidity: numberOrNull(raw?.humidity ?? raw?.HUMIDITY),
    rgRatio: numberOrNull(raw?.rgRatio ?? raw?.RG_RATIO ?? raw?.color ?? raw?.COLOR),
    mq137: numberOrNull(raw?.mq137 ?? raw?.MQ137 ?? raw?.mq135 ?? raw?.MQ135),
    tgs2620: numberOrNull(raw?.tgs2620 ?? raw?.TGS2620),
    tgs822: numberOrNull(raw?.tgs822 ?? raw?.TGS822),
  };
}

export function normalizeBatch(raw: any): BatchListItem {
  return {
    batchId: stringOrEmpty(raw?.batchId ?? raw?.BATCH_ID),
    lastTimestamp: stringOrEmpty(raw?.lastTimestamp ?? raw?.TIMESTAMP),
    latestTemperature: numberOrNull(raw?.latestTemperature ?? raw?.temperature ?? raw?.TEMPERATURE),
    latestHumidity: numberOrNull(raw?.latestHumidity ?? raw?.humidity ?? raw?.HUMIDITY),
    latestRgRatio: numberOrNull(
      raw?.latestRgRatio ?? raw?.rgRatio ?? raw?.RG_RATIO ?? raw?.latestColor ?? raw?.COLOR,
    ),
    latestMq137: numberOrNull(
      raw?.latestMq137 ?? raw?.mq137 ?? raw?.MQ137 ?? raw?.latestMq135 ?? raw?.MQ135,
    ),
    latestTgs2620: numberOrNull(raw?.latestTgs2620 ?? raw?.tgs2620 ?? raw?.TGS2620),
    latestTgs822: numberOrNull(raw?.latestTgs822 ?? raw?.tgs822 ?? raw?.TGS822),
    glp: numberOrNull(raw?.glp ?? raw?.GLP),
    price: numberOrNull(raw?.price ?? raw?.PRICE),
  };
}

export function normalizeSummary(raw: any): BatchSummary {
  return {
    batchId: stringOrEmpty(raw?.batchId ?? raw?.BATCH_ID),
    factoryId: stringOrEmpty(raw?.factoryId ?? raw?.FACTORY_ID),
    glp: numberOrNull(raw?.glp ?? raw?.GLP),
    price: numberOrNull(raw?.price ?? raw?.PRICE),
  };
}

function normalizeGraphPoints(raw: unknown): GraphPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((point: any) => ({
    timestamp: stringOrEmpty(point?.timestamp ?? point?.TIMESTAMP),
    value: numberOrNull(point?.value ?? point?.VALUE) ?? 0,
  }));
}

export function normalizeGraphs(payload: any, fallbackBatchId: string): BatchGraphs {
  const raw = getObjectPayload<any>(payload, {});
  return {
    batchId: stringOrEmpty(raw?.batchId ?? raw?.BATCH_ID) || fallbackBatchId,
    temperature: normalizeGraphPoints(raw?.temperature),
    humidity: normalizeGraphPoints(raw?.humidity),
    rgRatio: normalizeGraphPoints(raw?.rgRatio ?? raw?.color),
    mq137: normalizeGraphPoints(raw?.mq137 ?? raw?.mq135),
    tgs2620: normalizeGraphPoints(raw?.tgs2620),
    tgs822: normalizeGraphPoints(raw?.tgs822),
  };
}

export function getErrorMessage(err: any): string {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Something went wrong'
  );
}
