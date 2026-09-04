import { supabase, ProductWithImages } from '@/lib/supabase';
import CatalogGrid from '@/app/components/CatalogGrid';

export const revalidate = 0;

async function getProducts(): Promise<ProductWithImages[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

async function getLogoUrl(): Promise<string | null> {
  const { data } = await supabase.from('site_settings').select('logo_url').eq('id', 1).maybeSingle();
  return data?.logo_url ?? null;
}

export default async function CatalogPage() {
  const [products, logoUrl] = await Promise.all([getProducts(), getLogoUrl()]);

  return (
    <main className="min-h-screen">
      {/* Cabeçalho editorial */}
      <header className="border-b border-line px-6 py-10 sm:px-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="font-body text-sm tracking-wide text-muted">Catálogo</p>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="mt-2 max-h-24 w-auto" />
          ) : (
            <h1 className="mt-2 font-display text-4xl italic text-ink sm:text-6xl">Catálogo</h1>
          )}
        </div>
      </header>

      {/* Grid de produtos */}
      <section className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16">
        <CatalogGrid products={products} />
      </section>

      <footer className="border-t border-line px-6 py-8 sm:px-12">
        <p className="font-body text-xs text-muted">
          Catálogo para demonstração — sem opção de compra online.
        </p>
      </footer>
    </main>
  );
}
