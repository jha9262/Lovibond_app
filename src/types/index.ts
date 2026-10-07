export interface User {
  userId: string;
  name: string;
  designation: string;
  role?: string;
  password?: string;
  createdDate?: string;
  configKey?: string;
}

export interface Sample {
  key?: string;
  sampleId: string;
  userId: string;
  userName?: string;
  modeOfSample: string;
  sampleType: string;
  source: string;
  mainSource: string;
  customer: string;
  customerAddress?: string;
  habitation: string;
  district: string;
  sampleDateOfIssue: string;
  sampleSubmittedDate: string;
  customerReferenceNo?: string;
  sampleSubmittedBy?: string;
  sampleReceiptDate?: string;
  testReportNo?: string;
  endDate?: string;
  latitude: number | string;
  longitude: number | string;
  testAddress: string;
  testVillage: string;
  testTaluka: string;
  testDistrict: string;
  createdDate?: string;
}

export interface Device {
  slaveId: string | number;
  name: string;
  make: string;
  model: string;
  controllerPin: string;
  configDetails: ConfigDetail[];
  originalIndex?: number;
}

export interface ConfigDetail {
  serialNo: number;
  parameterName: string;
  addressType: string;
  address: string;
  scalingDecimal: string;
  dataType: string;
  unit: string;
  registerFunction: string;
  value?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface WebSocketPayload {
  timestamp?: string;
  color?: string;
  turbidity?: string;
  connected?: boolean;
  [key: string]: any;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  formattedAddress: string;
  shortAddress: string;
  city: string;
  district: string;
  state: string;
  country: string;
  postalCode: string;
  source: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalSamples: number;
  availableSamples: number;
  electrochemistryTests: number;
  electrochemistryInventory: number;
  photometerTests: number;
  photometerInventory: number;
}

export enum ConnectionStatusType {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

export type UserRole = 'MASTER' | 'ADMIN' | 'USER' | 'OPERATOR' | string;

export interface LoginRequest {
  USER_ID: string;
  PASSWORD: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  USER_ID?: string;
  USER_NAME?: string;
  ROLE?: UserRole;
}
