'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { CATEGORIES, type ProductWithImages } from '@/lib/supabase';

function formatPrice(price: number) {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function PriceTag({ price, originalPrice }: { price: number; originalPrice: number | null }) {
  if (originalPrice && originalPrice > price) {
    return (
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-body text-xs text-muted line-through">{formatPrice(originalPrice)}</span>
        <span className="font-body text-sm text-wine">{formatPrice(price)}</span>
      </div>
    );
  }
  return <p className="font-body text-sm text-wine">{formatPrice(price)}</p>;
}

function ProductCard({ product }: { product: ProductWithImages }) {
  const images = useMemo(() => {
    const extra = [...(product.product_images ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.image_url);
    return [product.image_url, ...extra].filter((url): url is string => Boolean(url));
  }, [product]);

  const [index, setIndex] = useState(0);
  const current = images[index] ?? null;

  return (
    <article className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-line">
        {current ? (
          <Image
            src={current}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-body text-xs text-muted">sem foto</span>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((index - 1 + images.length) % images.length)}
              aria-label="Foto anterior"
              className="absolute left-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center bg-ivory/80 text-ink hover:bg-ivory"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setIndex((index + 1) % images.length)}
              aria-label="Próxima foto"
              className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center bg-ivory/80 text-ink hover:bg-ivory"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-ink' : 'bg-ink/30'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="mt-4">
        <h2 className="font-display text-lg text-ink">{product.name}</h2>
        {product.description && (
          <p className="mt-1 whitespace-pre-line font-body text-sm leading-relaxed text-muted">
            {product.description}
          </p>
        )}
        <div className="mt-2">
          <PriceTag price={product.price} originalPrice={product.original_price} />
        </div>
      </div>
    </article>
  );
}

export default function CatalogGrid({ products }: { products: ProductWithImages[] }) {
  const [selected, setSelected] = useState<string>('Todos');
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = products.filter((p) => {
    const matchesCategory = selected === 'Todos' || p.category === selected;
    const matchesQuery =
      normalizedQuery === '' ||
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.description.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  if (products.length === 0) {
    return (
      <div className="border border-dashed border-line py-24 text-center">
        <p className="font-display text-xl italic text-muted">Nenhuma peça publicada ainda.</p>
        <p className="mt-2 font-body text-sm text-muted">
          Assim que os produtos forem cadastrados, eles aparecem aqui.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar peça pelo nome…"
          className="w-full max-w-sm border border-line bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-wine"
        />
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        {['Todos', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelected(cat)}
            className={`border px-4 py-1.5 font-body text-sm transition-colors ${
              selected === cat
                ? 'border-ink bg-ink text-ivory'
                : 'border-line text-muted hover:border-ink hover:text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-line py-24 text-center">
          <p className="font-display text-xl italic text-muted">Nenhuma peça encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
