'use client';

import { useEffect, useState, FormEvent } from 'react';
import { supabase, Product, ProductImage, CATEGORIES } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function AdminPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <p className="font-body text-sm text-muted">Carregando…</p>
      </div>
    );
  }

  return session ? <Dashboard /> : <LoginForm />;
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('E-mail ou senha incorretos.');
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm border border-line p-8">
        <h1 className="font-display text-2xl italic text-ink">Área administrativa</h1>
        <p className="mt-1 font-body text-sm text-muted">Entre para gerenciar o catálogo.</p>

        <label className="mt-6 block font-body text-xs text-muted">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-wine"
        />

        <label className="mt-4 block font-body text-xs text-muted">Senha</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-wine"
        />

        {error && <p className="mt-3 font-body text-xs text-wine">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-ink py-2.5 font-body text-sm text-ivory transition-colors hover:bg-wine disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

function LogoSection() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('logo_url')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => setLogoUrl(data?.logo_url ?? null));
  }, []);

  async function handleSave() {
    if (!file) return;
    setSaving(true);
    setError('');
    try {
      const ext = file.name.split('.').pop();
      const path = `logo-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(path);
      const { error: upsertError } = await supabase
        .from('site_settings')
        .upsert({ id: 1, logo_url: publicUrlData.publicUrl });
      if (upsertError) throw upsertError;
      setLogoUrl(publicUrlData.publicUrl);
      setFile(null);
    } catch (err: any) {
      setError(err.message ?? 'Erro ao salvar a logo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pt-10 sm:px-12">
      <div className="border border-line p-6">
        <h2 className="font-display text-lg italic text-ink">Logo do site</h2>
        <p className="mt-1 font-body text-xs text-muted">
          Aparece no lugar do título grande &quot;Catálogo&quot; na página pública.
        </p>

        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo atual" className="mt-4 max-h-16" />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="font-body text-sm text-ink"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!file || saving}
            className="bg-ink px-4 py-2 font-body text-sm text-ivory hover:bg-wine disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar logo'}
          </button>
        </div>

        {error && <p className="mt-3 font-body text-xs text-wine">{error}</p>}
      </div>
    </div>
  );
}

function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Apagar este produto?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadProducts();
  }

  return (
    <div className="min-h-screen bg-ivory">
      <header className="flex items-center justify-between border-b border-line px-6 py-6 sm:px-12">
        <h1 className="font-display text-2xl italic text-ink">Painel do catálogo</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="bg-ink px-4 py-2 font-body text-sm text-ivory hover:bg-wine"
          >
            + Novo produto
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="font-body text-sm text-muted hover:text-ink"
          >
            Sair
          </button>
        </div>
      </header>

      <LogoSection />

      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-12">
        {loading ? (
          <p className="font-body text-sm text-muted">Carregando…</p>
        ) : products.length === 0 ? (
          <p className="font-body text-sm text-muted">Nenhum produto cadastrado ainda.</p>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-4 py-4">
                <div className="h-16 w-12 flex-shrink-0 overflow-hidden bg-line">
                  {p.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-display text-base text-ink">{p.name}</p>
                  <p className="font-body text-xs text-muted">
                    {p.category} · {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditing(p);
                    setShowForm(true);
                  }}
                  className="font-body text-sm text-ink hover:text-wine"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="font-body text-sm text-muted hover:text-wine"
                >
                  Apagar
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [originalPrice, setOriginalPrice] = useState(product?.original_price?.toString() ?? '');
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!product) return;
    supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true })
      .then(({ data }) => setExistingImages(data ?? []));
  }, [product]);

  async function handleRemoveImage(imageId: string) {
    if (!confirm('Remover esta foto?')) return;
    await supabase.from('product_images').delete().eq('id', imageId);
    setExistingImages((imgs) => imgs.filter((img) => img.id !== imageId));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let image_url = product?.image_url ?? null;

      if (file) {
        const ext = file.name.split('.').pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(path, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('products').getPublicUrl(path);
        image_url = data.publicUrl;
      }

      const payload = {
        name,
        description,
        price: parseFloat(price.replace(',', '.')) || 0,
        original_price: originalPrice.trim() ? parseFloat(originalPrice.replace(',', '.')) || null : null,
        category,
        image_url,
      };

      let productId = product?.id ?? null;

      if (product) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select().single();
        if (error) throw error;
        productId = data.id;
      }

      if (extraFiles.length > 0 && productId) {
        const uploads = await Promise.all(
          extraFiles.map(async (extraFile, i) => {
            const ext = extraFile.name.split('.').pop();
            const path = `${crypto.randomUUID()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('products').upload(path, extraFile);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('products').getPublicUrl(path);
            return {
              product_id: productId,
              image_url: data.publicUrl,
              sort_order: existingImages.length + i,
            };
          })
        );
        const { error: insertError } = await supabase.from('product_images').insert(uploads);
        if (insertError) throw insertError;
      }

      onSaved();
    } catch (err: any) {
      setError(err.message ?? 'Erro ao salvar o produto.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-line bg-ivory p-8"
      >
        <h2 className="font-display text-xl italic text-ink">
          {product ? 'Editar produto' : 'Novo produto'}
        </h2>

        <label className="mt-6 block font-body text-xs text-muted">Nome</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-wine"
        />

        <label className="mt-4 block font-body text-xs text-muted">Categoria</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-wine"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label className="mt-4 block font-body text-xs text-muted">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-wine"
        />

        <label className="mt-4 block font-body text-xs text-muted">Preço (R$)</label>
        <input
          required
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0,00"
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-wine"
        />

        <label className="mt-4 block font-body text-xs text-muted">
          Preço original (opcional, pra mostrar desconto)
        </label>
        <input
          inputMode="decimal"
          value={originalPrice}
          onChange={(e) => setOriginalPrice(e.target.value)}
          placeholder="0,00"
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-wine"
        />

        <label className="mt-4 block font-body text-xs text-muted">
          Foto principal {product?.image_url && '(deixe em branco para manter a atual)'}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full font-body text-sm text-ink"
        />

        <label className="mt-4 block font-body text-xs text-muted">Fotos adicionais</label>

        {existingImages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {existingImages.map((img) => (
              <div key={img.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image_url} alt="" className="h-16 w-16 object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-ink text-xs text-ivory hover:bg-wine"
                  aria-label="Remover foto"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setExtraFiles(Array.from(e.target.files ?? []))}
          className="mt-2 w-full font-body text-sm text-ink"
        />

        {error && <p className="mt-3 font-body text-xs text-wine">{error}</p>}

        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-ink py-2.5 font-body text-sm text-ivory hover:bg-wine disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-line py-2.5 font-body text-sm text-ink hover:border-ink"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
