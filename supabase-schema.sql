-- Rode este script inteiro no SQL Editor do seu projeto Supabase
-- (Supabase Dashboard > SQL Editor > New query > cole e clique em Run)

-- 1. Tabela de produtos
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0,
  image_url text,
  created_at timestamptz not null default now()
);

-- 2. Ativa segurança em nível de linha
alter table products enable row level security;

-- 3. Qualquer pessoa pode LER os produtos (é um catálogo público)
create policy "Produtos são públicos para leitura"
  on products for select
  using (true);

-- 4. Só usuários autenticados (você, o admin) podem criar/editar/apagar
create policy "Somente admin autenticado pode inserir"
  on products for insert
  to authenticated
  with check (true);

create policy "Somente admin autenticado pode atualizar"
  on products for update
  to authenticated
  using (true);

create policy "Somente admin autenticado pode apagar"
  on products for delete
  to authenticated
  using (true);

-- 5. Bucket de storage para as fotos dos produtos
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "Fotos de produtos são públicas para leitura"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "Somente admin autenticado pode enviar fotos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products');

create policy "Somente admin autenticado pode apagar fotos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products');
