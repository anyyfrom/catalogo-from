-- Rode este script no SQL Editor do Supabase DEPOIS do supabase-schema.sql original
-- (Supabase Dashboard > SQL Editor > New query > cole e clique em Run)

-- 1. Categoria e preço original (para desconto) nos produtos
alter table products add column if not exists category text not null default 'Outros';
alter table products add column if not exists original_price numeric(10,2);

-- 2. Fotos adicionais por produto (variações de imagem)
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table product_images enable row level security;

create policy "Fotos extras são públicas para leitura"
  on product_images for select
  using (true);

create policy "Somente admin autenticado pode inserir fotos extras"
  on product_images for insert
  to authenticated
  with check (true);

create policy "Somente admin autenticado pode apagar fotos extras"
  on product_images for delete
  to authenticated
  using (true);

-- 3. Configurações do site (logo)
create table if not exists site_settings (
  id int primary key,
  logo_url text
);

insert into site_settings (id) values (1)
on conflict (id) do nothing;

alter table site_settings enable row level security;

create policy "Configurações são públicas para leitura"
  on site_settings for select
  using (true);

create policy "Somente admin autenticado pode inserir configurações"
  on site_settings for insert
  to authenticated
  with check (true);

create policy "Somente admin autenticado pode atualizar configurações"
  on site_settings for update
  to authenticated
  using (true);
