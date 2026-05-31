-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exchange" TEXT NOT NULL DEFAULT 'IDX',
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "sector" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessModel" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "previousClose" DOUBLE PRECISION NOT NULL,
    "marketCap" DOUBLE PRECISION NOT NULL,
    "enterpriseValue" DOUBLE PRECISION NOT NULL,
    "sharesOutstanding" DOUBLE PRECISION NOT NULL,
    "dividendYield" DOUBLE PRECISION NOT NULL,
    "peRatio" DOUBLE PRECISION NOT NULL,
    "pbvRatio" DOUBLE PRECISION NOT NULL,
    "evEbitda" DOUBLE PRECISION NOT NULL,
    "roe" DOUBLE PRECISION NOT NULL,
    "roa" DOUBLE PRECISION NOT NULL,
    "beta" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Financial" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "netIncome" DOUBLE PRECISION NOT NULL,
    "grossProfit" DOUBLE PRECISION NOT NULL,
    "operatingIncome" DOUBLE PRECISION NOT NULL,
    "ebitda" DOUBLE PRECISION NOT NULL,
    "freeCashFlow" DOUBLE PRECISION NOT NULL,
    "operatingCashFlow" DOUBLE PRECISION NOT NULL,
    "totalAssets" DOUBLE PRECISION NOT NULL,
    "totalEquity" DOUBLE PRECISION NOT NULL,
    "totalDebt" DOUBLE PRECISION NOT NULL,
    "cash" DOUBLE PRECISION NOT NULL,
    "grossMargin" DOUBLE PRECISION NOT NULL,
    "operatingMargin" DOUBLE PRECISION NOT NULL,
    "netMargin" DOUBLE PRECISION NOT NULL,
    "eps" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Financial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Watchlist',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL,
    "watchlistId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Portfolio',
    "cash" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioHolding" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "avgCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Valuation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "revenueGrowth" DOUBLE PRECISION NOT NULL,
    "operatingMargin" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL,
    "wacc" DOUBLE PRECISION NOT NULL,
    "terminalGrowth" DOUBLE PRECISION NOT NULL,
    "projectionYears" INTEGER NOT NULL DEFAULT 5,
    "intrinsicValue" DOUBLE PRECISION NOT NULL,
    "fairValuePerShare" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "marginOfSafety" DOUBLE PRECISION NOT NULL,
    "sensitivity" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Valuation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "targetPrice" DOUBLE PRECISION,
    "sections" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_ticker_key" ON "Company"("ticker");

-- CreateIndex
CREATE INDEX "Company_sector_idx" ON "Company"("sector");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Financial_companyId_idx" ON "Financial"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Financial_companyId_fiscalYear_key" ON "Financial"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "Watchlist_userId_idx" ON "Watchlist"("userId");

-- CreateIndex
CREATE INDEX "WatchlistItem_watchlistId_idx" ON "WatchlistItem"("watchlistId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_watchlistId_companyId_key" ON "WatchlistItem"("watchlistId", "companyId");

-- CreateIndex
CREATE INDEX "Portfolio_userId_idx" ON "Portfolio"("userId");

-- CreateIndex
CREATE INDEX "PortfolioHolding_portfolioId_idx" ON "PortfolioHolding"("portfolioId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioHolding_portfolioId_companyId_key" ON "PortfolioHolding"("portfolioId", "companyId");

-- CreateIndex
CREATE INDEX "Valuation_userId_idx" ON "Valuation"("userId");

-- CreateIndex
CREATE INDEX "Valuation_companyId_idx" ON "Valuation"("companyId");

-- CreateIndex
CREATE INDEX "ResearchReport_userId_idx" ON "ResearchReport"("userId");

-- CreateIndex
CREATE INDEX "ResearchReport_companyId_idx" ON "ResearchReport"("companyId");

-- CreateIndex
CREATE INDEX "ResearchHistory_userId_idx" ON "ResearchHistory"("userId");

-- AddForeignKey
ALTER TABLE "Financial" ADD CONSTRAINT "Financial_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioHolding" ADD CONSTRAINT "PortfolioHolding_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioHolding" ADD CONSTRAINT "PortfolioHolding_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valuation" ADD CONSTRAINT "Valuation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valuation" ADD CONSTRAINT "Valuation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchReport" ADD CONSTRAINT "ResearchReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchReport" ADD CONSTRAINT "ResearchReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchHistory" ADD CONSTRAINT "ResearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchHistory" ADD CONSTRAINT "ResearchHistory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
