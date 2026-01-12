
import { PriceDataPoint, MarketStats, TimeRange, NewsEvent } from '../types';
import { LanguageCode } from './translations';

// Default provided dataset
const DEFAULT_CSV_DATA = `Start,End,Open,High,Low,Close,Volume,Market Cap
2026-01-06,2026-01-07,93964.52,94360.91,91571.83,93705.2,60273127619.56446,1865200559281.3171
2026-01-05,2026-01-06,91851.19,94744.46,91717.48,93920.64,48601965975.1324,1861456777268.547
2026-01-04,2026-01-05,90950.79,91685.02,90940.04,91427.2,32516490504.08014,1823456422963.1672
2026-01-03,2026-01-04,90036.54,90684.45,89416.03,90628,47876066235.20209,1798835049138.7212
2026-01-02,2026-01-03,88735.88,90884.64,88421.9,89931.76,38881748013.63415,1785521742973.4773
2026-01-01,2026-01-02,87701.89,88875.03,87561.13,88834.01,34661264973.72125,1757280038914.4844
2025-12-31,2026-01-01,88420.18,89135.12,87338.51,87641.1,43453807185.4216,1763334935615.4426
2025-12-30,2025-12-31,87264.28,89287.99,86952.64,88505.84,49135189674.39373,1755660729551.965
2025-12-29,2025-12-30,87841.09,90319.97,86984.12,87257.17,46376485944.78397,1762766887426.8572
2025-12-28,2025-12-29,87901.26,88006.88,87500.05,87886.05,17446801986.979095,1752752112422.1604
2025-12-27,2025-12-28,87344.05,87864.3,87290.33,87852.06,32531434870.543552,1747587447354.4844
2025-12-26,2025-12-27,87242.21,89481.81,86780.01,87392.61,43334587040.41812,1759790390442.5715
2025-12-25,2025-12-26,87634.06,88538.94,87076.02,87259.28,27747674027.512196,1752608582212.1777
2025-12-24,2025-12-25,87570.21,88009.78,86619.98,87695.39,45498309768.83972,1743052380902.223
2025-12-23,2025-12-24,88510.3,88905.62,86856.39,87434.6,53641321031.310104,1753166855678.4355
2025-12-22,2025-12-23,88740.39,90284.7,88027.37,88574.25,39922078090.50174,1780151480978.3345
2025-12-21,2025-12-22,88359.72,89069.24,87680.89,88599.97,22127572066.240417,1762691548961.3555
2025-12-20,2025-12-21,88090.02,88519.95,87961.59,88380.01,41837149252.637634,1761392471234.1743
2025-12-19,2025-12-20,85466.76,88768.66,85170.76,88134.07,71893288935.76306,1746718217718.0383
2025-12-18,2025-12-19,86206.37,89359.96,84493.49,85483.08,76283161420.66202,1730717740351.0837
2025-12-17,2025-12-18,87626.85,90228.01,85373.96,86081.94,66982889851.94425,1734147141449.899
2025-12-16,2025-12-17,86455.05,87975.95,85374.97,87841.36,78802509796.51917,1733588632206.2856
2025-12-15,2025-12-16,88294.04,89942.03,85357.07,86406.04,54860242093.39024,1761907253770.8433
2025-12-14,2025-12-15,90152.56,90446.27,87932.57,88219.98,27339138694.418118,1786344922200.129
2025-12-13,2025-12-14,90407.54,90608.85,89960.04,90251.97,41756796075.58885,1801839477313.5332
2025-12-12,2025-12-13,92460.92,92695.59,89596.59,90288.94,69843455537.66551,1828022811891.0417
2025-12-11,2025-12-12,91988.05,93352.15,89426.67,92467.35,84042413088.2648,1808914366530.5994
2025-12-10,2025-12-11,92669.78,94229.27,91737.22,92003.88,77591757960.8676,1844714635221.6306
2025-12-09,2025-12-10,90617.38,94465.98,89787.67,92735.96,65977587581.777,1823545860555.3276
2025-12-08,2025-12-09,90355.85,92206.95,89732.98,90601.25,63798692415.43554,1817617674262.5156
2025-12-07,2025-12-08,89279.22,91633.72,87877.81,90180,35778556550.47387,1790755592012.1985
2025-12-06,2025-12-07,89219.62,90129.99,88964.15,89220.33,55113877075.665504,1787443820018.0557
2025-12-05,2025-12-06,92219.87,92657.97,88342.48,89289.7,65474248743.770035,1814282630308.7249
2025-12-04,2025-12-05,93415.12,94014.17,90955.15,92132.65,95648140514.33449,1853072708482.5679
2025-12-03,2025-12-04,91247.56,94028.1,91122.77,93637.68,112787500008.14983,1853426831438.5854
2025-12-02,2025-12-03,86317.59,92253.9,86220.03,91279.88,90800618533.38327,1769154636427.965
2025-12-01,2025-12-02,89918.97,89918.97,83930.25,86277.99,89677237431.18816,1718476658749.9373
2025-11-30,2025-12-01,90844.71,91954.91,90395.4,90395.4,31105592503.763065,1819545940026.244
2025-11-29,2025-11-30,90951.13,91102.04,90228.56,90822.83,51089258257.47387,1810296313711.3135
2025-11-28,2025-11-29,91198.17,92937.17,90251.89,90954.11,65821286647.53658,1822350172123.8293
2025-11-27,2025-11-28,90418,91832.04,90179.01,91293.26,94344388864.4007,1820918030980.3484
2025-11-26,2025-11-27,87557.77,90575.95,86422.99,90512.74,82579085781.71777,1757398305728.4321
2025-11-25,2025-11-26,88133.97,88512.98,86254.26,87388.48,84791054162.63066,1745086983283.8362
2025-11-24,2025-11-25,86639.63,89201.62,85485.02,88271.06,91199962359.14285,1740523615420.4495
2025-11-23,2025-11-24,84926.19,87992.07,84926.19,86808.22,71720314334.59233,1726712912588.2368
2025-11-22,2025-11-23,85294.51,85598.03,83533.46,84723.57,123101526759.88153,1683994295010.5088
2025-11-21,2025-11-22,86737.49,87402.99,80847.48,85155.8,169696946365.88928,1688847487703.1
2025-11-20,2025-11-21,91446.05,93008.37,86116.51,86798.04,110370368587.14635,1804051239210.3345
2025-11-19,2025-11-20,92677.96,92799.46,88626.08,91467.91,97780768610.46341,1815620210017.195
2025-11-18,2025-11-19,92276,93787.8,89467.73,92861.02,163835786257.18118,1831316500688.7595
2025-11-17,2025-11-18,94217.07,95989.17,91400,92147.19,126652313855.79094,1880344241343.2021
2025-11-16,2025-11-17,95604.52,96630.01,93050.01,94514.76,60231986261.01394,1899544000085.1846
2025-11-15,2011-11-16,94997.55,96697.8,94824.18,95570.93,124644658046.71428,1913165645297.92
2025-11-14,2025-11-15,99621.9,99828.83,94240.03,94578.47,152517582896.81882,1930107432566.8396
2025-11-13,2025-11-14,101726,103931,98094.69,99790.5,100889277942.01045,2026421060799.331
2025-11-12,2025-11-13,103268,105229,101033,101540,99676914774.18466,2057441841488.85
2025-11-11,2025-11-12,105985,107291,102503,102984,120103626665.20906,2086367102855.575
2025-11-10,2025-11-11,104327,106560,104327,105946,101449378596.14635,2112777030500.7388
2025-11-09,2025-11-10,102325,105144,101501,104753,67078440614.560974,2051104698063.9373
2025-11-08,2025-11-09,103154,103406,101479,102323,91978315139.36934,2040557776826.425
2025-11-07,2025-11-08,101490,103993,99369,103445,100604296728.48781,2029882355679.3555
2025-11-06,2025-11-07,103616,104086,100553,101383,80825603848,2045263990349.805
2025-11-05,2025-11-06,101366,104520,99012.91,103906,156683165513.40765,2044774142207.2996
2025-11-04,2025-11-05,106507,107280,99145.57,101654,122894382983.17421,2069341477102.38
2025-11-03,2025-11-04,110579,110718,105350,106569,72106261873.43509,2145880145292.014
2025-11-02,2025-11-03,110042,111197,109530,110628,41283062156.59233,2200332292396.6724
2025-11-01,2025-11-02,109444,110466,109432,110053,61303892671.47735,2195489379057.8083
2025-10-31,2025-11-01,108466,111094,108421,109620,107878524153.82579,2186905338339.7283
2025-10-30,2025-10-31,109986,111537,106370,108234,132996275825.01743,2174241074696.6062
2025-10-29,2025-10-30,112870,113560,109837,110006,108915969461.6899,2239007229906.3
2025-10-28,2025-10-29,113956,116000,112463,112955,78944161484.08711,2277602875071.3657
2025-10-27,2025-10-28,114732,116073,113860,114173,105751325299.63763,2295338032585.711
2025-10-26,2025-10-27,111584,114902,111260,114480,70342078364.31708,2248613520485.181
2025-10-25,2025-10-26,111001,111916,110698,111615,49297397503.26132,2221730381157.209
2025-10-24,2025-10-25,110106,111584,109918,110982,71558169531.86833,2208926837768.477
2025-10-23,2025-10-24,107598,111253,107597,110030,93112037332.74565,2181186842891.7979
2025-10-22,2025-10-23,108454,108898,106794,107617,129342213832.05923,2153555556798.5051
2025-10-21,2025-10-22,110406,113766,107535,108529,98492464205.50174,2187856554943.0383
2025-10-20,2025-10-21,108354,111547,107667,110556,87947734501.92334,2201834371145.331
2025-10-19,2025-10-20,107162,109408,106147,108606,48886933143.04181,2149541981355.8884
2025-10-18,2025-10-19,106363,107319,106352,107130,96374438174.34146,2131465852107.4111
2010-07-17,2010-07-18,0.05,0.05,0.05,0.05,0,170803.15248842558`;

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

// Localized News Events Data (Initial State)
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

// Internal store for the current dataset, defaulting to the hardcoded CSV
let currentPriceHistory: any[] = [];
let newsDataStore: Record<LanguageCode, NewsEvent[]> = { ...DEFAULT_NEWS_DATA };

// Try loading from LS for persistent news updates
try {
    const storedNews = localStorage.getItem('site_news_data');
    if (storedNews) {
        newsDataStore = JSON.parse(storedNews);
    }
} catch (e) { console.error(e); }

/**
 * Parses a CSV string into an array of internal raw data objects.
 * Expects a header row and comma-separated values.
 */
const parseCSVString = (csvString: string): any[] => {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());

    // Basic validation to ensure it looks like our data
    // We allow flexibility, but 'Start' or 'Date' is usually needed for timestamps.
    // If headers don't match exactly, we'll try to map common names or index.
    
    return lines.slice(1).map(line => {
        // Handle potential empty lines
        if (!line.trim()) return null;

        const values = line.split(',');
        const entry: any = {};
        
        headers.forEach((h, i) => {
            if (values[i] !== undefined) {
                entry[h] = values[i];
            }
        });
        
        // Flexible field mapping
        const dateStr = entry.Start || entry.Date || entry.date || entry.timestamp;
        const closePrice = entry.Close || entry.Price || entry.close || entry.price || '0';
        const openPrice = entry.Open || entry.open || '0';
        const highPrice = entry.High || entry.high || '0';
        const lowPrice = entry.Low || entry.low || '0';
        const vol = entry.Volume || entry.volume || '0';
        const cap = entry['Market Cap'] || entry.MarketCap || entry.marketcap || '0';

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;

        // Note: We used to format with local date, but standard ISO YYYY-MM-DD is better for comparisons
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

// Initialize with default data
currentPriceHistory = parseCSVString(DEFAULT_CSV_DATA);

/**
 * Updates the internal dataset with new CSV data provided by the user.
 * @param csvText The raw CSV string content.
 * @throws Error if parsing fails or no valid data is found.
 */
export const uploadCustomData = (csvText: string): void => {
    try {
        const parsed = parseCSVString(csvText);
        if (parsed.length === 0) {
            throw new Error("No valid records found in the provided CSV.");
        }
        currentPriceHistory = parsed;
    } catch (e: any) {
        console.error("CSV Import Error:", e);
        throw new Error(e.message || "Failed to parse CSV data.");
    }
};

export const fetchHistoricalData = async (range: TimeRange): Promise<PriceDataPoint[]> => {
    const allData = currentPriceHistory;
    if (allData.length === 0) return [];

    const latestTimestamp = allData[allData.length - 1].timestamp;
    
    let filtered = allData;
    if (range !== TimeRange.MAX) {
        const daysToSubtract = parseInt(range);
        const cutoff = latestTimestamp - (daysToSubtract * 24 * 60 * 60 * 1000);
        filtered = allData.filter(d => d.timestamp >= cutoff);
    }

    return filtered.map(d => ({
        timestamp: d.timestamp,
        price: d.close,
        formattedTime: d.formattedTime,
        dateString: d.dateString // Include raw date string for matching
    }));
};

export const fetchMarketStats = async (): Promise<MarketStats | null> => {
    const allData = currentPriceHistory;
    if (allData.length === 0) return null;

    const latest = allData[allData.length - 1];
    const previous = allData[allData.length - 2] || latest;
    
    const priceChange = latest.close - previous.close;
    const priceChangePercent = (priceChange / previous.close) * 100;

    // Calculate 1 Year Stats
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const cutoffTime = latest.timestamp - oneYearMs;
    
    const yearData = allData.filter(d => d.timestamp >= cutoffTime);
    // If dataset is shorter than a year, use all data
    const statsData = yearData.length > 0 ? yearData : allData;

    let high1y = -Infinity;
    let low1y = Infinity;
    let highMarketCap1y = -Infinity;
    
    // Track dates for stats
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
    
    // Safety check defaults
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
};

export const getNewsEvents = (lang: LanguageCode = 'en'): NewsEvent[] => {
    return newsDataStore[lang] || newsDataStore['en'];
};

// Admin Functions
export const updateNewsData = (lang: LanguageCode, events: NewsEvent[]): void => {
    newsDataStore[lang] = events;
    localStorage.setItem('site_news_data', JSON.stringify(newsDataStore));
};

export const getRawPriceData = () => currentPriceHistory;
