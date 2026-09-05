import React from 'react';
import { homeProducts, OLIVE_YOUNG_HOME } from '../../data/products';

export const HomeProducts: React.FC = () => (
  <section id="at-home" className="scroll-mt-20 px-5 py-12 sm:px-8 sm:py-16">
    <div className="mx-auto max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-miyeon-main/40">
            And at home
          </p>
          <h2 className="mt-2 font-display text-2xl font-normal text-miyeon-main sm:text-3xl">
            Take Korea home with you
          </h2>
        </div>
        <a
          href={OLIVE_YOUNG_HOME}
          target="_blank"
          rel="noreferrer"
          className="hidden text-sm text-miyeon-main/50 transition-colors hover:text-miyeon-main md:inline"
        >
          Shop all →
        </a>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-6">
        {homeProducts.map((product) => (
          <a
            key={product.id}
            href={product.oliveYoungUrl}
            target="_blank"
            rel="noreferrer"
            className="group block"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="aspect-square w-full rounded-2xl object-cover transition-transform group-hover:scale-[1.01]"
            />
            <p className="mt-3 text-sm font-semibold text-miyeon-main">{product.name}</p>
            {product.tagline && (
              <p className="mt-0.5 text-xs text-miyeon-main/50">{product.tagline}</p>
            )}
            <p className="mt-1 text-sm font-medium text-miyeon-sub1">${product.price}</p>
          </a>
        ))}
      </div>
    </div>
  </section>
);
