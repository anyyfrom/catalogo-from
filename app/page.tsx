import { supabase, Product } from '@/lib/supabase';
import Image from 'next/image';

export const revalidate = 0;

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

function formatPrice(price: number) {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen">
      {/* Cabeçalho editorial */}
      <header className="border-b border-line px-6 py-10 sm:px-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="font-body text-sm tracking-wide text-muted">
            Coleção atual
          </p>
          <h1 className="mt-2 font-display text-4xl italic text-ink sm:text-6xl">
            Catálogo
          </h1>
        </div>
      </header>

      {/* Grid de produtos */}
      <section className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16">
        {products.length === 0 ? (
          <div className="border border-dashed border-line py-24 text-center">
            <p className="font-display text-xl italic text-muted">
              Nenhuma peça publicada ainda.
            </p>
            <p className="mt-2 font-body text-sm text-muted">
              Assim que os produtos forem cadastrados, eles aparecem aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-line">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-body text-xs text-muted">
                        sem foto
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg text-ink">
                      {product.name}
                    </h2>
                    {product.description && (
                      <p className="mt-1 max-w-[42ch] font-body text-sm leading-relaxed text-muted">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <p className="whitespace-nowrap font-body text-sm text-wine">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-line px-6 py-8 sm:px-12">
        <p className="font-body text-xs text-muted">
          Catálogo para demonstração — sem opção de compra online.
        </p>
      </footer>
    </main>
  );
}
