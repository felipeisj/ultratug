-- Initial schema for Ultratug Inventory System

-- Enable RLS
-- Tables: profiles, ships, warehouses, products, stock, movements

-- 1. Ships
CREATE TABLE IF NOT EXISTS ships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    imo_number TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Warehouses (Pañoles)
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    barcode TEXT UNIQUE NOT NULL,
    unit TEXT DEFAULT 'unidad',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Stock (current quantity per warehouse)
CREATE TABLE IF NOT EXISTS stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity DECIMAL NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, warehouse_id)
);

-- 5. Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT CHECK (role IN ('ADMIN', 'OPERARIO')) DEFAULT 'OPERARIO',
    ship_id UUID REFERENCES ships(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Movements
CREATE TABLE IF NOT EXISTS movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('INGRESO', 'RETIRO', 'TRASLADO')) NOT NULL,
    product_id UUID REFERENCES products(id),
    from_warehouse_id UUID REFERENCES warehouses(id),
    to_warehouse_id UUID REFERENCES warehouses(id),
    quantity DECIMAL NOT NULL,
    notes TEXT,
    sent_by UUID REFERENCES profiles(id),
    received_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

-- Basic readable by authenticated
CREATE POLICY "Authenticated users can read ships" ON ships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read warehouses" ON warehouses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read stock" ON stock FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read movements" ON movements FOR SELECT TO authenticated USING (true);

-- Admin can do everything
CREATE POLICY "Admins can manage everything" ON ships FOR ALL TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN'
);
-- (Add more specific policies as needed later)
