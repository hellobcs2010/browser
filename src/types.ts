export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
  isOnion: boolean;
  favicon?: string;
  loadTimeMs?: number;
  dnsResult?: DnsQueryResponse | null;
  securityStatus: 'secure-onion' | 'secure-doh' | 'standard';
  errorMessage?: string | null;
}

export interface DnsQueryResponse {
  success: boolean;
  domain: string;
  type: string;
  status: number;
  isDNSSEC: boolean;
  latencyMs: number;
  resolver: string;
  answers: Array<{ name: string; type: number; TTL: number; data: string }>;
  authority?: Array<any>;
  isOnion?: boolean;
  strictDohEnforced: boolean;
  error?: string;
}

export interface FastGateway {
  id: string;
  name: string;
  domain: string;
}

export interface ShieldsConfig {
  strictDoh1111: boolean;
  webRtcBlocked: boolean;
  antiFingerprinting: boolean;
  autoWipeOnExit: boolean;
  noTorRelayLag: boolean;
  blockTelemetry: boolean;
  spoofUserAgent: boolean;
}

export interface OnionSite {
  id: string;
  title: string;
  titleUrdu: string;
  category: 'search' | 'privacy' | 'media' | 'directory' | 'utility';
  categoryUrdu: string;
  onionUrl: string;
  description: string;
  descriptionUrdu: string;
  badge: string;
  badgeUrdu: string;
  icon: string;
}
