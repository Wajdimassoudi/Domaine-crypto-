import { Domain } from '../types';

const PROXY_BASE = '/api/dynadot';

// Helper: Parse XML Response from Dynadot
const parseXml = (xmlStr: string) => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlStr, "text/xml");
};

// Helper to call the proxy
const callProxy = async (commandParams: string): Promise<{ success: boolean, data: Document, raw: string }> => {
  try {
    const res = await fetch(`${PROXY_BASE}?${commandParams}`);
    const text = await res.text();
    
    // Check for proxy/network errors
    if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
    }

    const xmlDoc = parseXml(text);
    const responseCode = xmlDoc.getElementsByTagName("ResponseCode")[0]?.textContent;
    
    // Dynadot ResponseCode 0 means success
    const success = responseCode === "0";
    
    return { success, data: xmlDoc, raw: text };
  } catch (error) {
    console.error("Dynadot API Error:", error);
    throw error;
  }
};

export const dynadot = {
  // 1. Search Logic (Real-time)
  search: async (keyword: string): Promise<Domain[]> => {
    // Command: search usually requires separate API access or use 'check' for specific domains.
    // We will use 'search' command if available, or 'check' logic.
    // Note: Dynadot 'search' command might differ based on API tier. We'll use 'search' here.
    const result = await callProxy(`command=search&keyword=${keyword}&show_price=1`);
    
    if (!result.success) return [];

    const results = result.data.getElementsByTagName("SearchResult");
    const mappedDomains: Domain[] = [];

    for (let i = 0; i < results.length; i++) {
        const item = results[i];
        const nameFull = item.getAttribute("DomainName") || "";
        const status = item.getAttribute("Status") || "unknown"; // available, taken
        const priceStr = item.getAttribute("Price") || "0";

        if (nameFull && status === 'available') {
            const parts = nameFull.split('.');
            const tld = '.' + parts[parts.length - 1];
            
            mappedDomains.push({
                id: `real_${nameFull}`,
                name: parts.slice(0, -1).join('.'),
                tld: tld as any,
                fullName: nameFull,
                price: parseFloat(priceStr),
                currency: 'USDT', // Map Dynadot USD to USDT
                isPremium: false,
                owner: null,
                isListed: true,
                views: 0,
                description: "Available for immediate registration.",
                privacyEnabled: true,
                autoRenew: true,
                nameservers: [],
                dnsRecords: []
            });
        }
    }
    return mappedDomains;
  },

  // 2. Check Single Domain (For Details Page)
  checkDomain: async (domain: string): Promise<boolean> => {
    const result = await callProxy(`command=check&domain0=${domain}`);
    if (!result.success) return false;
    
    const item = result.data.getElementsByTagName("Domain")[0];
    const status = item?.getAttribute("Available");
    return status === "yes";
  },

  // 3. Register Domain (The Payment Step)
  registerDomain: async (domain: string, years: number) => {
    // Note: Real registration requires account balance on Dynadot.
    const result = await callProxy(`command=register&domain=${domain}&duration=${years}`);
    
    // Extract Order ID or Error
    if (result.success) {
        const regId = result.data.getElementsByTagName("RegistrationID")[0]?.textContent;
        return { success: true, id: regId || 'pending' };
    } else {
        const err = result.data.getElementsByTagName("Error")[0]?.textContent;
        return { success: false, error: err };
    }
  },

  // 4. Set Nameservers
  setNameservers: async (domain: string, ns1: string, ns2: string) => {
    const result = await callProxy(`command=set_ns&domain=${domain}&ns0=${ns1}&ns1=${ns2}`);
    return result.success;
  },

  // 5. Set Email Forwarding
  setEmailForwarding: async (domain: string, fromUser: string, toEmail: string) => {
     // This is specific to Dynadot forwarding logic
    const result = await callProxy(`command=set_email_forward&domain=${domain}&from=${fromUser}&to=${toEmail}`); 
    return result.success;
  },

  // 6. Set Whois Privacy
  setPrivacy: async (domain: string) => {
    const result = await callProxy(`command=set_privacy&domain=${domain}&state=on`);
    return result.success;
  }
};