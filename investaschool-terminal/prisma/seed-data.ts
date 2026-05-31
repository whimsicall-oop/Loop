/**
 * Seed dataset for Investaschool Terminal.
 * Figures are realistic, hand-tuned approximations for major IDX-listed
 * companies (values in IDR). They are illustrative sample data for an
 * educational product — not live market quotes.
 */

export interface SeedCompany {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  description: string;
  businessModel: string;
  website: string;
  price: number;
  previousClose: number;
  sharesOutstanding: number; // in shares
  dividendYield: number; // %
  peRatio: number;
  pbvRatio: number;
  evEbitda: number;
  roe: number; // %
  roa: number; // %
  beta: number;
  // Latest fiscal-year anchors (IDR) used to back-generate 5y history
  latestRevenue: number;
  latestNetMargin: number; // %
  revenueGrowth: number; // annual %, for back-generation
  grossMargin: number; // %
  operatingMargin: number; // %
  totalDebt: number;
  cash: number;
}

export const SEED_COMPANIES: SeedCompany[] = [
  {
    ticker: "BBCA",
    name: "Bank Central Asia Tbk",
    sector: "Financials",
    industry: "Banks — Regional",
    description:
      "PT Bank Central Asia Tbk is Indonesia's largest private bank by market capitalization, providing retail and corporate banking, transaction banking, and digital financial services.",
    businessModel:
      "Generates net interest income from a low-cost CASA deposit franchise and fee income from transaction banking, with a market-leading digital payments ecosystem.",
    website: "https://www.bca.co.id",
    price: 9850,
    previousClose: 9725,
    sharesOutstanding: 123_275_000_000,
    dividendYield: 2.6,
    peRatio: 23.5,
    pbvRatio: 4.8,
    evEbitda: 18.2,
    roe: 21.3,
    roa: 3.6,
    beta: 0.95,
    latestRevenue: 106_000_000_000_000,
    latestNetMargin: 47,
    revenueGrowth: 9,
    grossMargin: 70,
    operatingMargin: 58,
    totalDebt: 40_000_000_000_000,
    cash: 120_000_000_000_000,
  },
  {
    ticker: "BMRI",
    name: "Bank Mandiri (Persero) Tbk",
    sector: "Financials",
    industry: "Banks — Diversified",
    description:
      "PT Bank Mandiri (Persero) Tbk is Indonesia's largest bank by assets, offering corporate, commercial, SME, and consumer banking alongside a fast-growing digital platform (Livin').",
    businessModel:
      "State-owned bank earning net interest income across wholesale and retail segments, increasingly monetizing its digital super-app and treasury operations.",
    website: "https://www.bankmandiri.co.id",
    price: 6150,
    previousClose: 6225,
    sharesOutstanding: 93_333_000_000,
    dividendYield: 5.4,
    peRatio: 11.2,
    pbvRatio: 2.3,
    evEbitda: 9.8,
    roe: 22.4,
    roa: 2.9,
    beta: 1.15,
    latestRevenue: 152_000_000_000_000,
    latestNetMargin: 36,
    revenueGrowth: 11,
    grossMargin: 64,
    operatingMargin: 50,
    totalDebt: 90_000_000_000_000,
    cash: 150_000_000_000_000,
  },
  {
    ticker: "BBRI",
    name: "Bank Rakyat Indonesia (Persero) Tbk",
    sector: "Financials",
    industry: "Banks — Microfinance",
    description:
      "PT Bank Rakyat Indonesia (Persero) Tbk is the world's largest microfinance institution, dominant in Indonesian micro, small, and medium enterprise (MSME) lending.",
    businessModel:
      "Earns high-yield net interest income from micro and ultra-micro lending via an unrivalled rural distribution network and the BRILink agent ecosystem.",
    website: "https://www.bri.co.id",
    price: 4720,
    previousClose: 4690,
    sharesOutstanding: 151_559_000_000,
    dividendYield: 6.1,
    peRatio: 12.0,
    pbvRatio: 2.5,
    evEbitda: 10.1,
    roe: 19.8,
    roa: 3.1,
    beta: 1.1,
    latestRevenue: 178_000_000_000_000,
    latestNetMargin: 33,
    revenueGrowth: 10,
    grossMargin: 62,
    operatingMargin: 48,
    totalDebt: 110_000_000_000_000,
    cash: 130_000_000_000_000,
  },
  {
    ticker: "TLKM",
    name: "Telkom Indonesia (Persero) Tbk",
    sector: "Communication Services",
    industry: "Telecom Services",
    description:
      "PT Telkom Indonesia (Persero) Tbk is the country's largest telecommunications and digital services provider, operating mobile (Telkomsel), fixed broadband (IndiHome), data centers, and towers.",
    businessModel:
      "Recurring connectivity revenue from mobile and fixed broadband subscriptions, complemented by enterprise digital services, data centers, and infrastructure.",
    website: "https://www.telkom.co.id",
    price: 3180,
    previousClose: 3210,
    sharesOutstanding: 99_062_000_000,
    dividendYield: 5.0,
    peRatio: 13.6,
    pbvRatio: 2.6,
    evEbitda: 5.4,
    roe: 19.1,
    roa: 9.8,
    beta: 0.85,
    latestRevenue: 149_000_000_000_000,
    latestNetMargin: 16,
    revenueGrowth: 4,
    grossMargin: 55,
    operatingMargin: 30,
    totalDebt: 60_000_000_000_000,
    cash: 30_000_000_000_000,
  },
  {
    ticker: "ASII",
    name: "Astra International Tbk",
    sector: "Industrials",
    industry: "Conglomerates",
    description:
      "PT Astra International Tbk is a diversified Indonesian conglomerate with leadership in automotive, financial services, heavy equipment, mining, agribusiness, and infrastructure.",
    businessModel:
      "Diversified earnings across automotive distribution (Toyota, Honda), consumer financing, heavy equipment (United Tractors), and plantations, balancing cyclicality.",
    website: "https://www.astra.co.id",
    price: 4830,
    previousClose: 4790,
    sharesOutstanding: 40_484_000_000,
    dividendYield: 7.2,
    peRatio: 6.8,
    pbvRatio: 1.1,
    evEbitda: 5.0,
    roe: 16.5,
    roa: 8.4,
    beta: 1.05,
    latestRevenue: 316_000_000_000_000,
    latestNetMargin: 11,
    revenueGrowth: 6,
    grossMargin: 22,
    operatingMargin: 14,
    totalDebt: 80_000_000_000_000,
    cash: 45_000_000_000_000,
  },
  {
    ticker: "GOTO",
    name: "GoTo Gojek Tokopedia Tbk",
    sector: "Technology",
    industry: "Internet — Consumer",
    description:
      "PT GoTo Gojek Tokopedia Tbk is Indonesia's largest digital ecosystem, combining on-demand services (Gojek), e-commerce (Tokopedia), and financial technology (GoTo Financial).",
    businessModel:
      "Take-rate and advertising monetization across on-demand mobility/delivery, e-commerce GMV, and fintech, prioritizing the path to adjusted-EBITDA profitability.",
    website: "https://www.gotocompany.com",
    price: 64,
    previousClose: 62,
    sharesOutstanding: 1_185_000_000_000,
    dividendYield: 0,
    peRatio: -8.5,
    pbvRatio: 1.4,
    evEbitda: -6.2,
    roe: -12.0,
    roa: -7.5,
    beta: 1.6,
    latestRevenue: 15_000_000_000_000,
    latestNetMargin: -45,
    revenueGrowth: 24,
    grossMargin: 38,
    operatingMargin: -30,
    totalDebt: 5_000_000_000_000,
    cash: 25_000_000_000_000,
  },
  {
    ticker: "UNVR",
    name: "Unilever Indonesia Tbk",
    sector: "Consumer Staples",
    industry: "Household & Personal Products",
    description:
      "PT Unilever Indonesia Tbk manufactures and distributes leading home care, personal care, and food & refreshment brands across Indonesia.",
    businessModel:
      "High-margin, asset-light branded consumer goods with deep distribution; earnings driven by volume, pricing, and premiumization across staple categories.",
    website: "https://www.unilever.co.id",
    price: 2390,
    previousClose: 2420,
    sharesOutstanding: 38_150_000_000,
    dividendYield: 6.8,
    peRatio: 19.4,
    pbvRatio: 26.0,
    evEbitda: 12.8,
    roe: 95.0,
    roa: 28.0,
    beta: 0.7,
    latestRevenue: 38_600_000_000_000,
    latestNetMargin: 12,
    revenueGrowth: 1,
    grossMargin: 50,
    operatingMargin: 18,
    totalDebt: 3_000_000_000_000,
    cash: 800_000_000_000,
  },
  {
    ticker: "ICBP",
    name: "Indofood CBP Sukses Makmur Tbk",
    sector: "Consumer Staples",
    industry: "Packaged Foods",
    description:
      "PT Indofood CBP Sukses Makmur Tbk is a leading consumer packaged-foods producer, best known for the Indomie instant-noodle brand sold domestically and globally.",
    businessModel:
      "Branded packaged foods (noodles, dairy, snacks, seasonings) with strong pricing power and expanding international (notably African) distribution.",
    website: "https://www.indofoodcbp.com",
    price: 11200,
    previousClose: 11150,
    sharesOutstanding: 11_662_000_000,
    dividendYield: 2.9,
    peRatio: 14.5,
    pbvRatio: 2.9,
    evEbitda: 9.2,
    roe: 17.8,
    roa: 8.0,
    beta: 0.8,
    latestRevenue: 71_000_000_000_000,
    latestNetMargin: 13,
    revenueGrowth: 8,
    grossMargin: 36,
    operatingMargin: 20,
    totalDebt: 30_000_000_000_000,
    cash: 22_000_000_000_000,
  },
  {
    ticker: "BBNI",
    name: "Bank Negara Indonesia (Persero) Tbk",
    sector: "Financials",
    industry: "Banks — Diversified",
    description:
      "PT Bank Negara Indonesia (Persero) Tbk is a major state-owned bank focused on corporate, commercial, and consumer banking with a strong international presence.",
    businessModel:
      "Net interest and fee income across wholesale and consumer banking, leveraging a state-linked corporate franchise and growing digital channels (wondr).",
    website: "https://www.bni.co.id",
    price: 5475,
    previousClose: 5400,
    sharesOutstanding: 37_297_000_000,
    dividendYield: 4.5,
    peRatio: 9.4,
    pbvRatio: 1.3,
    evEbitda: 8.2,
    roe: 14.9,
    roa: 2.2,
    beta: 1.2,
    latestRevenue: 72_000_000_000_000,
    latestNetMargin: 29,
    revenueGrowth: 9,
    grossMargin: 60,
    operatingMargin: 45,
    totalDebt: 55_000_000_000_000,
    cash: 70_000_000_000_000,
  },
  {
    ticker: "ANTM",
    name: "Aneka Tambang Tbk",
    sector: "Materials",
    industry: "Metals & Mining",
    description:
      "PT Aneka Tambang Tbk (ANTAM) is a state-owned diversified mining company producing nickel, gold, bauxite, and alumina, central to Indonesia's EV battery-supply ambitions.",
    businessModel:
      "Commodity sales of nickel ore/ferronickel and gold, with downstream nickel processing growth tied to the electric-vehicle battery value chain.",
    website: "https://www.antam.com",
    price: 1565,
    previousClose: 1530,
    sharesOutstanding: 24_031_000_000,
    dividendYield: 3.4,
    peRatio: 12.7,
    pbvRatio: 1.7,
    evEbitda: 7.5,
    roe: 13.6,
    roa: 9.1,
    beta: 1.35,
    latestRevenue: 41_000_000_000_000,
    latestNetMargin: 8,
    revenueGrowth: 14,
    grossMargin: 18,
    operatingMargin: 12,
    totalDebt: 6_000_000_000_000,
    cash: 5_000_000_000_000,
  },
];
