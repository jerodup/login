CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    is_admin boolean NOT NULL DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    verification_token TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW() 
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name              text NOT NULL,
  slug              text NOT NULL UNIQUE,
  description       text,
  price_cents       integer NOT NULL CHECK (price_cents >= 0),
  currency_code     char(3) NOT NULL DEFAULT 'USD',
  stock_quantity    integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT NOW(),
  updated_at        timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products (is_active);

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.product_images (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url         text NOT NULL,
  alt_text          text,
  sort_order        integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images (product_id, sort_order);

CREATE TABLE IF NOT EXISTS public.carts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES public.users(id) ON DELETE SET NULL,
  guest_token       uuid UNIQUE, -- para invitados; generar en app si no hay user_id
  status            text NOT NULL DEFAULT 'active' CHECK (status IN ('active','converted','abandoned')),
  currency_code     char(3) NOT NULL DEFAULT 'USD',
  created_at        timestamptz NOT NULL DEFAULT NOW(),
  updated_at        timestamptz NOT NULL DEFAULT NOW(),
  expires_at        timestamptz
);

CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts (user_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON public.carts (status);

CREATE TRIGGER trg_carts_updated_at
BEFORE UPDATE ON public.carts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Items del carrito
CREATE TABLE IF NOT EXISTS public.cart_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id           uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id        uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity          integer NOT NULL CHECK (quantity > 0),
  unit_price_cents  integer NOT NULL CHECK (unit_price_cents >= 0), -- snapshot del precio al añadir
  created_at        timestamptz NOT NULL DEFAULT NOW(),
  updated_at        timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items (cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items (product_id);

CREATE TRIGGER trg_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number        text UNIQUE, -- opcional: setear desde app
  user_id             uuid REFERENCES public.users(id) ON DELETE SET NULL,
  cart_id             uuid REFERENCES public.carts(id) ON DELETE SET NULL,
  status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','completed','cancelled')),
  currency_code       char(3) NOT NULL DEFAULT 'USD',
  subtotal_cents      integer NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  shipping_cents      integer NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  tax_cents           integer NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  discount_cents      integer NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  total_cents         integer NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  -- Datos para invitados y contacto
  contact_name        text,
  contact_email       citext,
  contact_phone       text,
  -- Direcciones en JSONB para flexibilidad
  shipping_address    jsonb, -- { line1, line2, city, region, postal_code, country }
  billing_address     jsonb,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT NOW(),
  updated_at          timestamptz NOT NULL DEFAULT NOW(),
  paid_at             timestamptz,
  cancelled_at        timestamptz
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at);

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Items del pedido (snapshot de datos del producto)
CREATE TABLE IF NOT EXISTS public.order_items (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id           uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name_snapshot text NOT NULL,
  unit_price_cents     integer NOT NULL CHECK (unit_price_cents >= 0),
  quantity             integer NOT NULL CHECK (quantity > 0),
  total_cents          integer NOT NULL CHECK (total_cents >= 0),
  created_at           timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items (product_id);

-- ============================================================
-- Pagos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider             text NOT NULL, -- ej: 'stripe', 'paypal', 'cod'
  provider_payment_id  text,          -- id del pago en el proveedor
  status               text NOT NULL CHECK (status IN ('requires_action','pending','authorized','paid','failed','refunded','cancelled')),
  amount_cents         integer NOT NULL CHECK (amount_cents >= 0),
  currency_code        char(3) NOT NULL DEFAULT 'USD',
  raw_response         jsonb,         -- payload del proveedor
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON public.payments (provider, provider_payment_id);

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Opcional: Códigos de descuento/cupones
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code              text NOT NULL UNIQUE,
  description       text,
  discount_type     text NOT NULL CHECK (discount_type IN ('fixed','percent')),
  discount_value    integer NOT NULL CHECK (discount_value >= 0), -- cents o porcentual
  currency_code     char(3) NOT NULL DEFAULT 'USD',
  starts_at         timestamptz,
  ends_at           timestamptz,
  max_redemptions   integer CHECK (max_redemptions IS NULL OR max_redemptions > 0),
  times_redeemed    integer NOT NULL DEFAULT 0 CHECK (times_redeemed >= 0),
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT NOW(),
  updated_at        timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Relación de cupones aplicados a pedido
CREATE TABLE IF NOT EXISTS public.order_coupons (
  order_id        uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  coupon_id       uuid NOT NULL REFERENCES public.coupons(id) ON DELETE RESTRICT,
  applied_cents   integer NOT NULL DEFAULT 0 CHECK (applied_cents >= 0),
  PRIMARY KEY (order_id, coupon_id)
);

-- ============================================================
-- Vistas útiles (opcionales)
-- ============================================================
CREATE OR REPLACE VIEW public.v_active_products AS
SELECT p.*
FROM public.products p
WHERE p.is_active = true AND p.stock_quantity > 0;

-- ============================================================
-- Reglas mínimas de integridad de totales (a validar también en app)
-- ============================================================
ALTER TABLE public.orders
  ADD CONSTRAINT chk_orders_total_consistency
  CHECK (
    total_cents = GREATEST(0, subtotal_cents + shipping_cents + tax_cents - discount_cents)
  );
  