import axios from "axios";

const API_KEY = "9288c8ca29msh202e3f882223132p1ed9ebjsna02b8d7935f6";
const API_HOST = "yahoo-finance15.p.rapidapi.com";

const baseHeaders = {
  "x-rapidapi-key": API_KEY,
  "x-rapidapi-host": API_HOST,
};

interface MarketTickerResponse {
  meta: {
    version: string;
    status: number;
    copywrite: string;
    totalrecords: number;
    headers: {
      symbol: string;
      name: string;
      lastsale: string;
      netchange: string;
      pctchange: string;
      marketCap: string;
    };
  };
  body: StockTicker[];
}

export interface StockTicker {
  symbol: string;
  name: string;
  lastsale: string;
  netchange: string;
  pctchange: string;
  marketCap: string;
}

export interface StockHistoryData {
  body: {
    [timestamp: string]: {
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      date: string;
      date_utc: number;
    };
  };
  meta: {
    chartPreviousClose: number;
    currency: string;
    dataGranularity: string;
    exchangeName: string;
    exchangeTimezoneName: string;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    firstTradeDate: number;
    fullExchangeName: string;
    gmtoffset: number;
    hasPrePostMarketData: boolean;
    instrumentType: string;
    longName: string;
    previousClose: number;
    priceHint: number;
    processedTime: string;
    range: string;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketPrice: number;
    regularMarketTime: number;
    regularMarketVolume: number;
    scale: number;
    shortName: string;
    status: number;
    symbol: string;
    timezone: string;
    version: string;
  };
}

export interface StockModuleData {
  body: {
    address1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    website: string;
    industry: string;
    industryKey: string;
    industryDisp: string;
    sector: string;
    sectorKey: string;
    sectorDisp: string;
    longBusinessSummary: string;
    fullTimeEmployees: number;
    companyOfficers: Array<{
      maxAge: number;
      name: string;
      age: number;
      title: string;
      yearBorn: number;
      fiscalYear: number;
      totalPay: {
        raw: number;
        fmt: string;
        longFmt: string;
      };
      exercisedValue: {
        raw: number;
        fmt: string | null;
        longFmt: string;
      };
      unexercisedValue: {
        raw: number;
        fmt: string;
        longFmt: string;
      };
    }>;
    auditRisk: number;
    boardRisk: number;
    compensationRisk: number;
    shareHolderRightsRisk: number;
    overallRisk: number;
    governanceEpochDate: number;
    compensationAsOfEpochDate: number;
    irWebsite: string;
    executiveTeam: any[];
    maxAge: number;
  };
}

export interface InsiderTrade {
  symbol: string;
  symbolName: string;
  fullName: string;
  shortJobTitle: string;
  transactionType: string;
  amount: string;
  reportedPrice: string;
  usdValue: string;
  eodHolding: string;
  transactionDate: string;
  symbolCode: string;
  hasOptions: string;
  symbolType: number;
}

export interface InsiderTradesResponse {
  body: InsiderTrade[];
}

export interface NewsItem {
  url: string;
  img: string;
  title: string;
  text: string;
  source: string;
  type: string;
  tickers: string[];
  time: string;
  ago: string;
}

export interface NewsResponse {
  meta: {
    version: string;
    status: number;
    copywrite: string;
    total: number;
  };
  body: NewsItem[];
}

export interface SearchResult {
  shortname: string;
  quoteType: string;
  symbol: string;
  index: string;
  score: number;
  typeDisp: string;
  longname: string;
  exchDisp: string;
  sector?: string;
  sectorDisp?: string;
  industry?: string;
  industryDisp?: string;
  dispSecIndFlag?: boolean;
}

export interface SearchResponse {
  meta: {
    version: string;
    status: number;
    copywrite: string;
    symbol: string;
    processedTime: string;
  };
  body: SearchResult[];
}

export interface StockQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  marketCap: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  averageDailyVolume3Month: number;
}

export interface QuotesResponse {
  meta: {
    version: string;
    status: number;
    copywrite: string;
  };
  body: StockQuote[];
}

export async function fetchMarketTickers(
  page: number = 1,
  type: string = "STOCKS"
): Promise<MarketTickerResponse> {
  const options = {
    method: "GET",
    url: "https://yahoo-finance15.p.rapidapi.com/api/v2/markets/tickers",
    params: {
      page: page.toString(),
      type,
    },
    headers: baseHeaders,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error fetching market tickers:", error);
    throw error;
  }
}

export async function fetchStockHistory(
  symbol: string,
  interval: "1m" | "5m" | "15m" | "1d" | "1wk" | "1mo" = "1d",
  diffandsplits: "true" | "false" = "false"
): Promise<StockHistoryData> {
  const options = {
    method: "GET",
    url: "https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/history",
    params: {
      symbol,
      interval,
      diffandsplits,
    },
    headers: baseHeaders,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error fetching stock history:", error);
    throw error;
  }
}

export async function fetchStockModule(
  ticker: string,
  module: "asset-profile" | "summary-detail" | "default-key-statistics"
): Promise<StockModuleData> {
  const options = {
    method: "GET",
    url: "https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/modules",
    params: {
      ticker,
      module,
    },
    headers: baseHeaders,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error fetching stock module:", error);
    throw error;
  }
}

export async function fetchInsiderTrades(): Promise<InsiderTradesResponse> {
  const options = {
    method: "GET",
    url: "https://yahoo-finance15.p.rapidapi.com/api/v1/markets/insider-trades",
    headers: baseHeaders,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error fetching insider trades:", error);
    throw error;
  }
}

export async function fetchMarketNews(tickers?: string): Promise<NewsResponse> {
  const options = {
    method: "GET",
    url: "https://yahoo-finance15.p.rapidapi.com/api/v2/markets/news",
    params: {
      tickers,
      type: "ALL",
    },
    headers: baseHeaders,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error fetching market news:", error);
    throw error;
  }
}

export async function searchStocks(query: string): Promise<SearchResponse> {
  const options = {
    method: "GET",
    url: "https://yahoo-finance15.p.rapidapi.com/api/v1/markets/search",
    params: { search: query },
    headers: baseHeaders,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error searching stocks:", error);
    throw error;
  }
}

export async function fetchStockQuotes(
  symbols: string[]
): Promise<QuotesResponse> {
  const options = {
    method: "GET",
    url: "https://yahoo-finance15.p.rapidapi.com/api/v1/market/quotes",
    params: { symbols: symbols.join(",") },
    headers: baseHeaders,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error fetching stock quotes:", error);
    throw error;
  }
}
