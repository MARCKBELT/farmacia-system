-- CreateTable
CREATE TABLE "laboratories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contact_info" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "laboratories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "laboratory_id" INTEGER,
    "category" TEXT,
    "is_controlled" BOOLEAN NOT NULL DEFAULT false,
    "active_ingredient" TEXT,
    "unit_type" TEXT,
    "min_stock" INTEGER NOT NULL DEFAULT 10,
    "price_purchase" DECIMAL(10,2) NOT NULL,
    "price_sale" DECIMAL(10,2) NOT NULL,
    "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "batch_number" TEXT NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "warehouse_location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "laboratories_name_key" ON "laboratories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_barcode_idx" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_laboratory_id_idx" ON "products"("laboratory_id");

-- CreateIndex
CREATE INDEX "stock_expiration_date_idx" ON "stock"("expiration_date");

-- CreateIndex
CREATE INDEX "stock_product_id_quantity_idx" ON "stock"("product_id", "quantity");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_laboratory_id_fkey" FOREIGN KEY ("laboratory_id") REFERENCES "laboratories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
