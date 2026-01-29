export type CryptoCurrency = 'BNB' | 'BUSD' | 'USDT'; // BEP20 Only

export type TLD = 
  | '.com' | '.net' | '.org' | '.io' | '.ai' | '.co' | '.app' | '.xyz'
  | '.art' | '.info' | '.biz' | '.dev' | '.tech' | '.cloud' | '.me'
  | '.online' | '.site' | '.store' | '.shop' | '.club' | '.vip' | '.top'
  | '.work' | '.link' | '.click' | '.design' | '.fun' | '.wiki' | '.ink'
  | '.space' | '.tv' | '.cc' | '.gg' | '.vc';

export interface DnsRecord {
  id: string;
  type: 'A' | 'CNAME' | 'MX' | 'TXT';
  host: string;
  value: string;
  ttl: number;
}

export interface Domain {
  id: string;
  name: string;
  tld: TLD;
  fullName: string;
  price: number;
  currency: CryptoCurrency;
  isPremium: boolean;
  owner: string | null;
  isListed: boolean;
  registrationDate?: string;
  renewalDate?: string;
  views: number;
  description?: string;
  // New features
  privacyEnabled: boolean;
  autoRenew: boolean;
  nameservers: string[];
  dnsRecords: DnsRecord[];
  // Dynadot specific features
  forwardingEmail?: string; // Target email for forwarding (e.g., gmail)
  emailAlias?: string; // The alias (e.g., info@domain.com)
}

export interface User {
  id: string;
  walletAddress: string;
  username: string;
  balance: {
    BNB: number;
    BUSD: number;
    USDT: number;
  }
}

export interface Transaction {
  id: string;
  domainId: string;
  domainName: string;
  buyer: string;
  amount: number;
  currency: CryptoCurrency;
  date: string;
  hash: string;
  network: 'BSC (BEP20)';
  years: number; // Added registration duration
}