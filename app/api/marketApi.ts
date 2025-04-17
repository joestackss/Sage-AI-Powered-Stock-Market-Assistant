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
  meta: {
    symbol: string;
    firstTradeDate: number;
    regularMarketTime: number;
    gmtoffset: number;
    timezone: string;
    currentTradingPeriod: {
      pre: TradingPeriod;
      regular: TradingPeriod;
      post: TradingPeriod;
    };
  };
  timestamp: number[];
  indicators: {
    quote: Array<{
      high: number[];
      open: number[];
      low: number[];
      close: number[];
      volume: number[];
    }>;
  };
}

interface TradingPeriod {
  timezone: string;
  end: number;
  start: number;
  gmtoffset: number;
}

export interface StockModuleData {
  assetProfile?: {
    address1?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
    website?: string;
    industry?: string;
    sector?: string;
    longBusinessSummary?: string;
    fullTimeEmployees?: number;
    companyOfficers?: Array<{
      name: string;
      title: string;
      age?: number;
      yearBorn?: number;
      fiscalYear?: number;
      totalPay?: number;
      exercisedValue?: number;
      unexercisedValue?: number;
    }>;
  };
  summaryDetail?: {
    previousClose?: number;
    open?: number;
    dayLow?: number;
    dayHigh?: number;
    regularMarketPreviousClose?: number;
    regularMarketOpen?: number;
    regularMarketDayLow?: number;
    regularMarketDayHigh?: number;
    dividendRate?: number;
    dividendYield?: number;
    exDividendDate?: number;
    payoutRatio?: number;
    fiveYearAvgDividendYield?: number;
    beta?: number;
    trailingPE?: number;
    forwardPE?: number;
    volume?: number;
    regularMarketVolume?: number;
    averageVolume?: number;
    averageVolume10days?: number;
    averageDailyVolume10Day?: number;
    bid?: number;
    ask?: number;
    bidSize?: number;
    askSize?: number;
    marketCap?: number;
    fiftyTwoWeekLow?: number;
    fiftyTwoWeekHigh?: number;
    priceToSalesTrailing12Months?: number;
    fiftyDayAverage?: number;
    twoHundredDayAverage?: number;
    currency?: string;
    fromCurrency?: string;
    toCurrency?: string;
    lastMarket?: string;
    algorithm?: string;
    tradeable?: boolean;
  };
  defaultKeyStatistics?: {
    enterpriseValue?: number;
    forwardPE?: number;
    profitMargins?: number;
    floatShares?: number;
    sharesOutstanding?: number;
    sharesShort?: number;
    sharesShortPriorMonth?: number;
    shortRatio?: number;
    shortPercentOfFloat?: number;
    beta?: number;
    priceToBook?: number;
    pegRatio?: number;
    enterpriseToRevenue?: number;
    enterpriseToEbitda?: number;
    lastFiscalYearEnd?: number;
    mostRecentQuarter?: number;
    earningsQuarterlyGrowth?: number;
    revenueQuarterlyGrowth?: number;
    netIncomeToCommon?: number;
    trailingEps?: number;
    forwardEps?: number;
    bookValue?: number;
    lastSplitFactor?: string;
    lastSplitDate?: number;
  };
}

export interface InsiderTrade {
  startDate: string;
  ownership: string;
  filerName: string;
  transactionText: string;
  moneyText: string;
  filerRelation: string;
  shares: {
    amount: number;
    raw: number;
    fmt: string;
    longFmt: string;
  };
  maxAge: number;
  value: {
    amount: number;
    raw: number;
    fmt: string;
    longFmt: string;
  };
  filerUrl: string;
}

export interface InsiderTradesResponse {
  insiderTransactions: {
    transactions: InsiderTrade[];
  };
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
