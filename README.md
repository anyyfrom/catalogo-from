# Catálogo de Moda

Site de catálogo com painel administrativo. Sem carrinho, sem checkout — só vitrine.

- **Página pública** (`/`): mostra os produtos cadastrados.
- **Painel admin** (`/admin`): login + cadastro/edição/exclusão de produtos com foto.

---

## Passo a passo para colocar no ar (gratuito)

### 1. Criar o projeto no Supabase (banco de dados + fotos)

1. Vá em [supabase.com](https://supabase.com) e crie uma conta gratuita.
2. Clique em **New project**. Escolha um nome e uma senha para o banco (guarde essa senha).
3. Espere uns 2 minutos até o projeto ficar pronto.
4. No menu lateral, vá em **SQL Editor** → **New query**.
5. Abra o arquivo `supabase-schema.sql` (está nesta pasta), copie todo o conteúdo, cole no editor e clique em **Run**.
   - Isso cria a tabela de produtos e o espaço de armazenamento das fotos.
6. Vá em **Project Settings** (ícone de engrenagem) → **API**.
   - Copie a **Project URL** e a chave **anon public**. Você vai usar as duas no passo 3.
7. Crie seu usuário admin: vá em **Authentication** → **Users** → **Add user** → **Create new user**. Coloque seu e-mail e uma senha — é o login que você vai usar em `/admin`.

### 2. Rodar localmente (opcional, pra testar antes de publicar)

```bash
npm install
cp .env.local.example .env.local
# edite .env.local e cole a URL e a chave do Supabase
npm run dev
```

Abra `http://localhost:3000` (catálogo) e `http://localhost:3000/admin` (painel).

### 3. Publicar de graça na Vercel

1. Suba esta pasta para um repositório no GitHub (crie uma conta em [github.com](https://github.com) se não tiver).
2. Vá em [vercel.com](https://vercel.com), crie uma conta gratuita (dá pra entrar direto com o GitHub).
3. Clique em **Add New → Project**, escolha o repositório que você acabou de criar.
4. Antes de clicar em Deploy, abra **Environment Variables** e adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` → a URL do seu projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → a chave anon do Supabase
5. Clique em **Deploy**. Em ~1 minuto o site está no ar, com um link tipo `seu-catalogo.vercel.app`.

### 4. Domínio próprio (opcional)

Na Vercel, vá em **Settings → Domains** do projeto e siga as instruções para conectar um domínio comprado (ex: Registro.br, ~R$40/ano para `.com.br`).

---

## Custos

| Item | Custo |
|---|---|
| Hospedagem (Vercel, plano Hobby) | Grátis |
| Banco de dados + fotos (Supabase, plano Free) | Grátis até 500MB de banco e 1GB de armazenamento |
| Domínio próprio | Opcional, ~R$40-60/ano |

## Como cadastrar produtos no dia a dia

Depois de publicado, é só acessar `seusite.com/admin`, entrar com o e-mail/senha criados no passo 1.7, e clicar em **+ Novo produto**. Cada produto pede nome, descrição, preço e uma foto.
