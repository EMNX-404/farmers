export interface AIChatRequest {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'model';
    parts: string | Array<{ text: string }>;
  }>;
}

export interface AIChatResponse {
  success: boolean;
  message: string;
  contextSummary?: {
    marketsFound: number;
    farmersFound: number;
    productsFound: number;
  };
}

export interface AIRetrievedContext {
  markets: Array<{
    name: string;
    address: string;
    marketDays: string[];
    operatingHours: string;
  }>;
  farmers: Array<{
    businessName: string;
    marketDays: string[];
    pickupWindows: string[];
    markets: string[];
  }>;
  products: Array<{
    name: string;
    farmerName: string;
    category: string;
    price: number;
    unit: string;
    availabilityStatus: string;
    stockQuantity: number;
  }>;
}
