import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MATERIALS } from '../data/materials';
import { useTranslation } from 'react-i18next';

const TAGS = [
  { id: 'all', i18n: 'materials.catalog.tag_all' },
  { id: 'category', i18n: 'materials.catalog.tag_category' },
  { id: 'brand', i18n: 'materials.catalog.tag_brand' },
];

const SORTS = [
  { id: 'relevant', i18n: 'materials.catalog.sort_relevant' },
  { id: 'az', i18n: 'materials.catalog.sort_az' },
  { id: 'za', i18n: 'materials.catalog.sort_za' },
];

export default function Materials() {
  const { t } = useTranslation(); // dùng chung hoặc useTranslation('materials') nếu tách namespace
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('all');
  const [sort, setSort] = useState('relevant');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const tmo = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(tmo);
  }, [q, tag, sort]);

  const filtered = useMemo(() => {
    let list = [...MATERIALS];
    if (tag !== 'all') {
      list = list.filter((m) => {
        const s = m.slug;
        switch (tag) {
          case 'category':
            return s.includes('category');
          case 'brand':
            return s.includes('brand');
          default:
            return true;
        }
      });
    }
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(s) || m.desc.toLowerCase().includes(s)
      );
    }
    if (sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'za') list.sort((a, b) => b.title.localeCompare(a.title));
    return list;
  }, [q, tag, sort]);

  return (
    <main className="min-h-[70vh] bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <section className="border-b bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                {t('materials.catalog.title')}
              </h1>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative sm:min-w-[280px]">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t('materials.catalog.search_placeholder')}
                  className="w-full rounded-xl px-4 py-2.5 bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  aria-label={t('materials.catalog.search_placeholder')}
                />
                {q && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setQ('')}
                    aria-label="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl px-4 py-2.5 bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                aria-label="Sort"
              >
                {SORTS.map((op) => (
                  <option key={op.id} value={op.id}>
                    {t(op.i18n)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tag pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {TAGS.map((tg) => {
              const active = tag === tg.id;
              return (
                <button
                  key={tg.id}
                  onClick={() => setTag(tg.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition 
                    ${
                      active
                        ? 'bg-orange-500 text-white shadow'
                        : 'bg-white ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  aria-pressed={active}
                >
                  {t(tg.i18n)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Result info */}
      <div className="max-w-7xl mx-auto px-6 pt-6 text-sm text-gray-500">
        {!loading && (
          <p>
            {t('materials.catalog.result_showing')}{' '}
            <span className="font-medium text-gray-700">{filtered.length}</span>{' '}
            {t('materials.catalog.result_items')}
            {q ? (
              <>
                {' '}
                {t('materials.catalog.result_for')} "
                <span className="text-gray-700">{q}</span>"
              </>
            ) : null}
            {tag !== 'all' ? (
              <>
                {' '}
                {t('materials.catalog.result_in')} "
                <span className="text-gray-700">
                  {t(TAGS.find((x) => x.id === tag)?.i18n || '')}
                </span>
                "
              </>
            ) : null}
          </p>
        )}
      </div>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState
            onReset={() => {
              setQ('');
              setTag('all');
              setSort('relevant');
            }}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <article
                key={m.id}
                onClick={() => navigate(`/materials/${m.slug}`)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden ring-1 ring-black/5 hover:shadow-md transition"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={m.img}
                    alt={m.title}
                    className="w-full h-56 object-contain bg-gradient-to-b from-white to-gray-50 transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/20 via-black/10 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs bg-white/90 ring-1 ring-black/10">
                      {m.title}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                    {m.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mt-1">{m.desc}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      className="text-orange-600 group-hover:text-orange-700 font-medium inline-flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/materials/${m.slug}`);
                      }}
                      aria-label={`${t('materials.catalog.read_more')} ${
                        m.title
                      }`}
                    >
                      {t('materials.catalog.read_more')}
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M13.172 12 8.88 7.707l1.414-1.414L16 12l-5.707 5.707-1.414-1.414z" />
                      </svg>
                    </button>

                    <Link
                      to={`/materials/${m.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 rounded-lg text-sm bg-orange-50 text-orange-700 hover:bg-orange-100"
                    >
                      {t('materials.catalog.details')}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* Sub components giữ nguyên, chỉ i18n hóa text */
function SkeletonGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden ring-1 ring-black/5 bg-white"
        >
          <div className="h-56 bg-gray-100 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-2/3 bg-gray-100 animate-pulse rounded" />
            <div className="h-3 w-full bg-gray-100 animate-pulse rounded" />
            <div className="h-3 w-5/6 bg-gray-100 animate-pulse rounded" />
            <div className="h-9 w-32 bg-gray-100 animate-pulse rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
