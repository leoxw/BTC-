
import { PriceDataPoint, MarketStats, TimeRange, NewsEvent } from '../types';
import { LanguageCode } from './translations';

const API_BASE_URL = 'http://localhost:3001/api';

const getToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

// Cache for price data
let priceHistoryCache: any[] | null = null;

const EN_NEWS: NewsEvent[] = [
    { date: '2010-05-22', title: 'Bitcoin Pizza Day', description: 'Laszlo Hanyecz pays 10,000 BTC for two Papa John\'s pizzas.', type: 'neutral' },
    { date: '2011-02-09', title: 'Parity with US Dollar', description: 'Bitcoin reaches $1.00 for the first time.', type: 'positive' },
    { date: '2011-06-19', title: 'Mt. Gox Hacked', description: 'Massive security breach crashes price from $17 to $0.01 momentarily.', type: 'negative' },
    { date: '2013-10-02', title: 'Silk Road Seized', description: 'FBI shuts down Silk Road, seizing 26k BTC. Price drops initially.', type: 'negative' },
    { date: '2013-11-29', title: 'BTC Hits $1,000', description: 'Bitcoin surpasses $1,000 for the first time amidst growing adoption.', type: 'positive' },
    { date: '2014-02-24', title: 'Mt. Gox Collapse', description: 'Mt. Gox suspends trading and files for bankruptcy. Major market crash.', type: 'negative' },
    { date: '2017-12-17', title: 'CME Futures Launch / ATH', description: 'Bitcoin hits ~$20,000 as institutional futures trading begins.', type: 'positive' },
    { date: '2018-01-30', title: 'Regulatory Fears', description: 'Facebook bans crypto ads; fears of regulatory crackdowns in Asia.', type: 'negative' },
    { date: '2020-03-12', title: 'Black Thursday', description: 'Global markets crash due to COVID-19. BTC drops 50% in a day.', type: 'negative' },
    { date: '2020-05-11', title: '3rd Halving', description: 'Block reward reduced to 6.25 BTC.', type: 'positive' },
    { date: '2020-12-16', title: 'Breaking $20k', description: 'Bitcoin surpasses its 2017 all-time high.', type: 'positive' },
    { date: '2021-02-08', title: 'Tesla Buys Bitcoin', description: 'Tesla announces $1.5B investment in Bitcoin.', type: 'positive' },
    { date: '2021-04-14', title: 'Coinbase IPO', description: 'Coinbase goes public on Nasdaq, marking industry maturity.', type: 'positive' },
    { date: '2021-05-19', title: 'China Ban / Mining Crash', description: 'China reiterates crypto ban; mining hash rate plummets.', type: 'negative' },
    { date: '2021-09-07', title: 'El Salvador Adoption', description: 'Bitcoin becomes legal tender in El Salvador.', type: 'positive' },
    { date: '2021-11-10', title: 'New ATH $69k', description: 'Bitcoin reaches a peak of ~$69,000 driven by ETF hype.', type: 'positive' },
    { date: '2022-05-09', title: 'Terra/Luna Crash', description: 'UST depeg triggers massive market contagion.', type: 'negative' },
    { date: '2022-11-11', title: 'FTX Bankruptcy', description: 'FTX exchange collapses, sending BTC to cycle lows.', type: 'negative' },
    { date: '2024-01-10', title: 'Spot ETFs Approved', description: 'SEC approves first US Spot Bitcoin ETFs.', type: 'positive' },
    { date: '2024-04-19', title: '4th Halving', description: 'Block reward reduced to 3.125 BTC.', type: 'positive' },
    { date: '2024-11-05', title: 'US Election Impact', description: 'Market rallies on pro-crypto political sentiment.', type: 'positive' },
    { date: '2025-02-15', title: 'Global Sovereign Adoption', description: 'Major nation announces BTC as reserve asset reserve.', type: 'positive' },
    { date: '2025-08-20', title: 'Layer 2 Breakthrough', description: 'Lightning Network update enables near-zero fee global payments.', type: 'positive' },
    { date: '2025-11-15', title: 'Quantum Fear FUD', description: 'Rumors of quantum decryption cause temporary panic selling.', type: 'negative' },
];

const DEFAULT_NEWS_DATA: Record<LanguageCode, NewsEvent[]> = {
  en: EN_NEWS,
  zh: [
    { date: '2010-05-22', title: '比特币披萨日', description: 'Laszlo Hanyecz 用 10,000 BTC 购买了两个 Papa John\'s 披萨。', type: 'neutral' },
    { date: '2011-02-09', title: '与美元平价', description: '比特币首次达到 1.00 美元。', type: 'positive' },
    { date: '2011-06-19', title: 'Mt. Gox 被黑', description: '大规模安全漏洞导致价格瞬间从 $17 跌至 $0.01。', type: 'negative' },
    { date: '2013-10-02', title: '丝绸之路被查封', description: 'FBI 关闭丝绸之路并没收 2.6万 BTC。价格初期下跌。', type: 'negative' },
    { date: '2013-11-29', title: '突破 $1,000', description: '随着采用率增长，比特币首次突破 1,000 美元。', type: 'positive' },
    { date: '2014-02-24', title: 'Mt. Gox 倒闭', description: 'Mt. Gox 暂停交易并申请破产。市场大崩盘。', type: 'negative' },
    { date: '2017-12-17', title: 'CME 期货推出 / 历史新高', description: '随着机构期货交易开始，比特币达到约 20,000 美元。', type: 'positive' },
    { date: '2018-01-30', title: '监管恐慌', description: 'Facebook 禁止加密广告；亚洲监管打击引发恐慌。', type: 'negative' },
    { date: '2020-03-12', title: '黑色星期四', description: '受 COVID-19 影响全球市场崩盘。BTC 单日下跌 50%。', type: 'negative' },
    { date: '2020-05-11', title: '第三次减半', description: '区块奖励减少至 6.25 BTC。', type: 'positive' },
    { date: '2020-12-16', title: '突破 2万美元', description: '比特币超越 2017 年的历史最高点。', type: 'positive' },
    { date: '2021-02-08', title: '特斯拉买入比特币', description: '特斯拉宣布投资 15 亿美元比特币。', type: 'positive' },
    { date: '2021-04-14', title: 'Coinbase 上市', description: 'Coinbase 在纳斯达克上市，标志着行业成熟。', type: 'positive' },
    { date: '2021-05-19', title: '中国禁令 / 矿业崩盘', description: '中国重申加密禁令；挖矿算力暴跌。', type: 'negative' },
    { date: '2021-09-07', title: '萨尔瓦多采用', description: '比特币成为萨尔瓦多法定货币。', type: 'positive' },
    { date: '2021-11-10', title: '新高 $69k', description: '在 ETF 炒作推动下，比特币达到约 69,000 美元峰值。', type: 'positive' },
    { date: '2022-05-09', title: 'Terra/Luna 崩盘', description: 'UST 脱锚引发大规模市场传染。', type: 'negative' },
    { date: '2022-11-11', title: 'FTX 破产', description: 'FTX 交易所倒闭，将 BTC 送至周期低点。', type: 'negative' },
    { date: '2024-01-10', title: '现货 ETF 获批', description: 'SEC 批准首批美国现货比特币 ETF。', type: 'positive' },
    { date: '2024-04-19', title: '第四次减半', description: '区块奖励减少至 3.125 BTC。', type: 'positive' },
    { date: '2024-11-05', title: '美国大选影响', description: '受支持加密货币的政治情绪影响，市场反弹。', type: 'positive' },
    { date: '2025-02-15', title: '全球主权采用', description: '主要国家宣布将 BTC 作为储备资产。', type: 'positive' },
    { date: '2025-08-20', title: 'Layer 2 突破', description: '闪电网络更新实现了近乎零费用的全球支付。', type: 'positive' },
    { date: '2025-11-15', title: 'Quantum Fear FUD', description: 'Rumors of quantum decryption cause temporary panic selling.', type: 'negative' },
  ],
  ja: EN_NEWS,
  es: EN_NEWS,
  fr: EN_NEWS
};

const parseCSVString = (csvString: string): any[] => {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
        if (!line.trim()) return null;

        const values = line.split(',');
        const entry: any = {};
        
        headers.forEach((h, i) => {
            if (values[i] !== undefined) {
                entry[h] = values[i];
            }
        });
        
        const dateStr = entry.Start || entry.Date || entry.date || entry.timestamp;
        const closePrice = entry.Close || entry.Price || entry.close || entry.price || '0';
        const openPrice = entry.Open || entry.open || '0';
        const highPrice = entry.High || entry.high || '0';
        const lowPrice = entry.Low || entry.low || '0';
        const vol = entry.Volume || entry.volume || '0';
        const cap = entry['Market Cap'] || entry.MarketCap || entry.marketcap || '0';

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        return {
            timestamp: date.getTime(),
            dateString: dateString,
            open: parseFloat(openPrice),
            high: parseFloat(highPrice),
            low: parseFloat(lowPrice),
            close: parseFloat(closePrice),
            volume: parseFloat(vol),
            marketCap: parseFloat(cap),
            formattedTime: date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
        };
    })
    .filter(item => item !== null && !isNaN(item.close))
    .sort((a, b) => a.timestamp - b.timestamp);
};

export const uploadCustomData = async (csvText: string): Promise<void> => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(`${API_BASE_URL}/prices/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, csvData: csvText })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to upload data");
        }

        priceHistoryCache = null;
    } catch (e: any) {
        console.error("CSV Upload Error:", e);
        throw e;
    }
};

export const fetchHistoricalData = async (range: TimeRange): Promise<PriceDataPoint[]> => {
    try {
        const daysParam = range === TimeRange.MAX ? 'max' : range;
        const response = await fetch(`${API_BASE_URL}/prices?days=${daysParam}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error('Failed to fetch price data');
        }

        priceHistoryCache = data.data;
        return data.data.map((d: any) => ({
            timestamp: d.timestamp,
            price: d.close,
            formattedTime: d.formattedTime,
            dateString: d.dateString
        }));
    } catch (error) {
        console.error('Fetch historical data error:', error);
        return [];
    }
};

export const fetchMarketStats = async (): Promise<MarketStats | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/prices?days=max`);
        const data = await response.json();

        if (!response.ok || data.data.length === 0) {
            return null;
        }

        const allData = data.data;
        const latest = allData[allData.length - 1];
        const previous = allData[allData.length - 2] || latest;
        
        const priceChange = latest.close - previous.close;
        const priceChangePercent = (priceChange / previous.close) * 100;

        const oneYearMs = 365 * 24 * 60 * 60 * 1000;
        const cutoffTime = latest.timestamp - oneYearMs;
        
        const yearData = allData.filter((d: any) => d.timestamp >= cutoffTime);
        const statsData = yearData.length > 0 ? yearData : allData;

        let high1y = -Infinity;
        let low1y = Infinity;
        let highMarketCap1y = -Infinity;
        
        let high1yDate = '';
        let low1yDate = '';
        let highMarketCap1yDate = '';

        for (const d of statsData) {
            if (d.high > high1y) {
                high1y = d.high;
                high1yDate = d.formattedTime;
            }
            if (d.low < low1y) {
                low1y = d.low;
                low1yDate = d.formattedTime;
            }
            if (d.marketCap > highMarketCap1y) {
                highMarketCap1y = d.marketCap;
                highMarketCap1yDate = d.formattedTime;
            }
        }
        
        if (high1y === -Infinity) { 
            high1y = latest.high; 
            high1yDate = latest.formattedTime; 
        }
        if (low1y === Infinity) { 
            low1y = latest.low; 
            low1yDate = latest.formattedTime; 
        }
        if (highMarketCap1y === -Infinity) { 
            highMarketCap1y = latest.marketCap; 
            highMarketCap1yDate = latest.formattedTime; 
        }

        return {
            currentPrice: latest.close,
            marketCap: latest.marketCap,
            volume24h: latest.volume,
            priceChangePercentage24h: priceChangePercent,
            high24h: latest.high,
            low24h: latest.low,
            high1y,
            low1y,
            highMarketCap1y,
            high1yDate,
            low1yDate,
            highMarketCap1yDate
        };
    } catch (error) {
        console.error('Fetch market stats error:', error);
        return null;
    }
};

export const getNewsEvents = async (lang: LanguageCode = 'en'): Promise<NewsEvent[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/news?lang=${lang}`);
        const data = await response.json();

        if (response.ok && data.events) {
            return data.events;
        }

        return DEFAULT_NEWS_DATA[lang] || DEFAULT_NEWS_DATA['en'];
    } catch (error) {
        console.error('Get news events error:', error);
        return DEFAULT_NEWS_DATA[lang] || DEFAULT_NEWS_DATA['en'];
    }
};

export const updateNewsData = async (lang: LanguageCode, events: NewsEvent[]): Promise<void> => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(`${API_BASE_URL}/news/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, lang, events })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to update news");
        }
    } catch (e: any) {
        console.error("Update news error:", e);
        throw e;
    }
};

export const getRawPriceData = (): any[] => {
    return priceHistoryCache || [];
};