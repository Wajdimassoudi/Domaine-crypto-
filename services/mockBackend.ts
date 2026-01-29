import { Domain, User, Transaction, TLD, DnsRecord } from '../types';

const STORAGE_KEYS = {
  DOMAINS: 'cryptoreg_domains_v6', // Bumped version to reset old prices
  USER: 'cryptoreg_user_v3',
  TRANSACTIONS: 'cryptoreg_txs_v3'
};

const DEFAULT_NS = ['ns1.cryptoreg.bsc', 'ns2.cryptoreg.bsc'];

// 1. DATA: Real Wholesale Prices from Dynadot CSV
// FORMAT: TLD: { cost (USD), category }
const TLD_WHOLESALE: Record<string, { cost: number, usage: string }> = {
    // Top Generic
    '.com': { cost: 10.88, usage: 'General Websites' },
    '.net': { cost: 12.52, usage: 'General Websites' },
    '.org': { cost: 10.53, usage: 'Non-Profit & General' },
    '.xyz': { cost: 1.99, usage: 'General Websites' },
    '.info': { cost: 3.00, usage: 'Informational' },
    '.biz': { cost: 6.65, usage: 'Business' },
    '.co': { cost: 9.30, usage: 'Startups & Company' },
    
    // Tech & Startups (High Margin)
    '.io': { cost: 28.89, usage: 'Technology Startups' },
    '.ai': { cost: 74.90, usage: 'Artificial Intelligence' },
    '.app': { cost: 10.00, usage: 'Mobile Apps' },
    '.dev': { cost: 10.00, usage: 'Developers' },
    '.tech': { cost: 6.64, usage: 'Technology' },
    '.cloud': { cost: 3.99, usage: 'Cloud Services' },
    '.me': { cost: 10.06, usage: 'Personal Brands' },

    // Niche & Cheap (High Volume)
    '.online': { cost: 2.50, usage: 'General Websites' },
    '.site': { cost: 2.50, usage: 'General Websites' },
    '.store': { cost: 2.50, usage: 'E-commerce' },
    '.shop': { cost: 1.00, usage: 'Shopping' },
    '.club': { cost: 4.00, usage: 'Communities' },
    '.vip': { cost: 4.00, usage: 'Exclusive' },
    '.top': { cost: 2.16, usage: 'Top Rankings' },
    '.work': { cost: 2.00, usage: 'Employment' },
    '.link': { cost: 7.71, usage: 'Short Links' },
    '.click': { cost: 1.50, usage: 'Marketing' },
    
    // Creative & Fun
    '.design': { cost: 10.92, usage: 'Designers' },
    '.art': { cost: 2.00, usage: 'Artists' },
    '.fun': { cost: 3.50, usage: 'Entertainment' },
    '.wiki': { cost: 2.00, usage: 'Knowledge Bases' },
    '.ink': { cost: 2.00, usage: 'Tattoo & Art' },
    '.space': { cost: 2.50, usage: 'Creative Space' },
    '.tv': { cost: 26.25, usage: 'Multimedia & Streaming' },
    '.cc': { cost: 3.99, usage: 'Alternative to .com' },
    '.gg': { cost: 53.50, usage: 'Gaming' },
    '.vc': { cost: 27.50, usage: 'Venture Capital' }
};

// 2. LOGIC: Profit Margin Calculator
const calculateSellPrice = (wholesale: number): number => {
    let margin = 5;
    
    if (wholesale < 3) margin = 6;        // Cheap (Cost $1 -> Sell $7) ~High % profit
    else if (wholesale < 15) margin = 8;  // Medium (Cost $10 -> Sell $18)
    else if (wholesale < 50) margin = 12; // High (Cost $28 -> Sell $40)
    else margin = 15;                     // Premium (Cost $75 -> Sell $90)

    // Strategy: Always end in .99 for psychological pricing
    const rawPrice = wholesale + margin;
    return Math.floor(rawPrice) + 0.99;
};

// Helper: Get Sell Price for a specific TLD (defaults to .com price if unknown)
const getPriceForTLD = (tld: string): number => {
    const data = TLD_WHOLESALE[tld] || TLD_WHOLESALE['.com'];
    return calculateSellPrice(data.cost);
};

// Words to mix for realistic domain generation
const PREFIXES = ['meta', 'crypto', 'block', 'chain', 'defi', 'nft', 'coin', 'token', 'web3', 'dao', 'eth', 'bnb', 'smart', 'future', 'hyper', 'cyber', 'pixel', 'auto', 'tech', 'data', 'cloud', 'moon', 'mars', 'solar', 'star', 'alpha', 'omega', 'zen', 'bit', 'net'];
const SUFFIXES = ['hub', 'lab', 'verse', 'world', 'land', 'base', 'dex', 'swap', 'market', 'trade', 'wallet', 'pay', 'box', 'zone', 'sys', 'link', 'node', 'gate', 'way', 'path', 'view', 'vision', 'core', 'prime', 'capital', 'ventures', 'fund'];

// Generate 327 Premium Domains
const generatePremiumInventory = (): Domain[] => {
    const domains: Domain[] = [];
    
    // Add specific high-value handwritten seeds first
    const seeds: Partial<Domain>[] = [
        { name: 'cloudmatrix', tld: '.ai', views: 1240 },
        { name: 'blockfin', tld: '.io', views: 850 },
        { name: 'pizzatime', tld: '.com', views: 5000 },
        { name: 'binance-trader', tld: '.org', views: 3200 },
        { name: 'satoshi', tld: '.com', views: 9999 },
        { name: 'gwei', tld: '.io', views: 4300 },
        { name: 'bsc-gem', tld: '.app', views: 2100 },
        { name: 'web3-identity', tld: '.xyz', views: 1500 },
        { name: 'nft-gallery', tld: '.art', views: 900 }
    ];

    let count = 0;
    const target = 327;
    const availableTlds = Object.keys(TLD_WHOLESALE);

    // 1. Add seeds
    seeds.forEach((seed, idx) => {
        // Calculate dynamic price based on TLD
        const baseSellPrice = getPriceForTLD(seed.tld as string);
        // Premium domains get a random premium multiplier (2x to 1000x)
        const premiumMultiplier = Math.floor(Math.random() * 50) + 10;
        const finalPrice = Math.floor(baseSellPrice * premiumMultiplier);

        domains.push({
            id: `seed_${idx}`,
            name: seed.name!,
            tld: seed.tld as TLD,
            fullName: `${seed.name}${seed.tld}`,
            price: finalPrice,
            currency: 'USDT', // Premium usually in USDT
            isPremium: true,
            owner: null,
            isListed: true,
            views: seed.views!,
            description: `Premium ${TLD_WHOLESALE[seed.tld!]?.usage || 'Digital'} domain.`,
            privacyEnabled: true,
            autoRenew: true,
            nameservers: DEFAULT_NS,
            dnsRecords: []
        });
        count++;
    });

    // 2. Generate the rest with Margin Pricing
    while (count < target) {
        const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
        const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
        const tld = availableTlds[Math.floor(Math.random() * availableTlds.length)];
        const name = `${prefix}${suffix}`;
        
        // Ensure uniqueness roughly
        if (!domains.find(d => d.name === name && d.tld === tld)) {
            const sellPriceUSD = getPriceForTLD(tld);
            
            // Randomly assign currency (BNB, BUSD, USDT)
            // If BNB, convert USD price to BNB (Approx $320/BNB)
            const currencyRand = Math.random();
            let currency: 'BNB' | 'BUSD' | 'USDT' = 'USDT';
            let displayPrice = sellPriceUSD;

            if (currencyRand < 0.33) {
                currency = 'BUSD';
                displayPrice = sellPriceUSD;
            } else if (currencyRand < 0.66) {
                currency = 'BNB';
                displayPrice = parseFloat((sellPriceUSD / 320).toFixed(3)); // Convert to BNB
            }

            domains.push({
                id: `gen_${count}_${Math.random().toString(36).substr(2,5)}`,
                name: name,
                tld: tld as TLD,
                fullName: `${name}${tld}`,
                price: displayPrice,
                currency: currency,
                isPremium: false, // Standard registration
                owner: null,
                isListed: true,
                views: Math.floor(Math.random() * 500) + 50,
                description: `Perfect for ${TLD_WHOLESALE[tld]?.usage || 'your next project'}.`,
                privacyEnabled: true,
                autoRenew: true,
                nameservers: DEFAULT_NS,
                dnsRecords: []
            });
            count++;
        }
    }

    return domains;
};

export const mockBackend = {
  // --- Domains ---
  getDomains: (): Domain[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.DOMAINS);
    if (!stored) {
      const generated = generatePremiumInventory();
      localStorage.setItem(STORAGE_KEYS.DOMAINS, JSON.stringify(generated));
      return generated;
    }
    const data = JSON.parse(stored);
    return data;
  },

  getDomainById: (id: string): Domain | undefined => {
    // 1. Try finding in DB
    const domains = mockBackend.getDomains();
    const found = domains.find(d => d.id === id);
    if (found) return found;

    // 2. If not found, check if it's a temporary generated ID from search
    if (id.startsWith('gen_')) {
        const parts = id.split('_'); 
        if (parts.length >= 3) {
            const tld = '.' + parts.pop();
            const name = parts.slice(1).join('_');
            return mockBackend.generateDynamicDomain(name, tld as TLD);
        }
    }
    return undefined;
  },

  saveDomain: (updatedDomain: Domain) => {
    const domains = mockBackend.getDomains();
    const index = domains.findIndex(d => d.id === updatedDomain.id);
    if (index !== -1) {
        domains[index] = updatedDomain;
    } else {
        domains.push(updatedDomain);
    }
    localStorage.setItem(STORAGE_KEYS.DOMAINS, JSON.stringify(domains));
  },

  generateDynamicDomain: (name: string, tld: TLD): Domain => {
      const sellPrice = getPriceForTLD(tld);
      return {
          id: `gen_${name}_${tld.replace('.', '')}`,
          name: name,
          tld: tld,
          fullName: `${name}${tld}`,
          price: sellPrice, 
          currency: 'USDT', // Default to USDT for clarity on search
          isPremium: false,
          owner: null,
          isListed: true,
          views: 1,
          description: `Available for immediate registration.`,
          privacyEnabled: true,
          autoRenew: true,
          nameservers: DEFAULT_NS,
          dnsRecords: []
      };
  },

  searchDomains: (query: string): Domain[] => {
    const domains = mockBackend.getDomains();
    const q = query.toLowerCase().trim();
    if (!q) return domains;

    let results: Domain[] = [];
    let searchName = q;
    let searchTld: string | null = null;

    if (q.includes('.')) {
        const parts = q.split('.');
        searchName = parts[0];
        searchTld = '.' + parts[1];
    }

    const dbMatches = domains.filter(d => 
        d.fullName.includes(q) || d.name === searchName
    );
    results.push(...dbMatches);

    // Dynamic generation if not found in pre-generated list
    if (searchTld) {
        const exactExists = results.find(d => d.fullName === q);
        if (!exactExists && TLD_WHOLESALE[searchTld]) {
            results.unshift(mockBackend.generateDynamicDomain(searchName, searchTld as TLD));
        }
    } else {
        // Suggest .com, .io, .ai if searching without TLD
        const comExists = results.find(d => d.name === searchName && d.tld === '.com');
        if (!comExists) {
            results.unshift(mockBackend.generateDynamicDomain(searchName, '.com'));
        }
    }

    // Add suggestions for other popular TLDs
    const suggestionTlds: TLD[] = ['.io', '.ai', '.xyz', '.net', '.app'];
    suggestionTlds.forEach(tld => {
        if (!results.find(r => r.name === searchName && r.tld === tld) && (!searchTld || searchTld !== tld)) {
            results.push(mockBackend.generateDynamicDomain(searchName, tld));
        }
    });

    return results;
  },

  // --- Auth ---
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  connectWallet: (): User => {
    const mockUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      username: 'BSC_Whale',
      walletAddress: '0x4B...99a1',
      balance: {
        BNB: 45.2,
        BUSD: 12500,
        USDT: 5000
      }
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
    return mockUser;
  },

  disconnect: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // --- Transactions ---
  purchaseDomain: (
      domainId: string, 
      years: number = 1, 
      customNs: string[] = [], 
      emailConfig?: { enabled: boolean, email: string }
    ): { success: boolean, message: string } => {
    
    const user = mockBackend.getCurrentUser();
    if (!user) return { success: false, message: "BSC Wallet not connected" };

    let domain = mockBackend.getDomainById(domainId);
    
    if (!domain) return { success: false, message: "Domain unavailable" };
    if (domain.owner) return { success: false, message: "Domain already owned" };

    if (domainId.startsWith('gen_')) {
        domain.id = 'dom_' + Math.random().toString(36).substr(2, 9);
    }

    // 1. RegisterDomain logic
    domain.owner = user.id;
    domain.isListed = false;
    domain.registrationDate = new Date().toISOString();
    
    // 2. SetNameservers logic
    if (customNs.length === 2) {
        domain.nameservers = customNs; // Custom NS from user input
    }

    // 3. SetEmailForwarding logic
    if (emailConfig && emailConfig.enabled) {
        domain.forwardingEmail = emailConfig.email;
        domain.emailAlias = 'info'; // Default alias
    }

    // 4. SetPrivacy logic (Auto ON)
    domain.privacyEnabled = true;

    // Set Expiry
    const renewalDate = new Date();
    renewalDate.setFullYear(renewalDate.getFullYear() + years);
    domain.renewalDate = renewalDate.toISOString();

    mockBackend.saveDomain(domain);

    const totalCost = domain.price * years;
    const tx: Transaction = {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      domainId: domain.id,
      domainName: domain.fullName,
      buyer: user.id,
      amount: totalCost,
      currency: domain.currency,
      date: new Date().toISOString(),
      hash: '0x' + Math.random().toString(36).substr(2, 40),
      network: 'BSC (BEP20)',
      years: years
    };
    
    const txs = mockBackend.getTransactions();
    txs.push(tx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

    return { success: true, message: `Successfully registered for ${years} year(s)!` };
  },

  getTransactions: (): Transaction[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return stored ? JSON.parse(stored) : [];
  }
};