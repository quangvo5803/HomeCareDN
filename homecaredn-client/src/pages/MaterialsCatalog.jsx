import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { materialService } from '../services/materialService';

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
function normalizeMaterial(raw) {
  const id = raw?.MaterialID ?? raw?.materialId ?? raw?.id;
  const title =
    raw?.Name ?? raw?.name ?? raw?.Title ?? raw?.title ?? `#${id ?? ''}`;
  const desc = raw?.Description ?? raw?.description ?? '';
  const images =
    raw?.Images ?? raw?.images ?? raw?.ImageUrls ?? raw?.imageUrls ?? [];
  const img =
    raw?.ImageUrl ??
    raw?.imageUrl ??
    (Array.isArray(images) ? images[0] : undefined);
  return {
    id,
    title,
    desc,
    img,
    categoryId: raw?.CategoryID ?? raw?.categoryId,
    brandId: raw?.BrandID ?? raw?.brandId,
  };
}
export default function Materials() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('all');
  const [sort, setSort] = useState('relevant');
  const [loading, setLoading] = useState(false);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [error, setError] = useState('');

  // Load danh sách từ API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await materialService.getAllMaterial();
        const list = Array.isArray(res) ? res : res?.data ?? [];
        const normalized = list
          .map(normalizeMaterial)
          .filter((x) => x.id != null);
        if (mounted) setItems(normalized);
      } catch (e) {
        console.error(e);
        if (mounted) setError('Failed to load materials');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Hiệu ứng skeleton khi đổi filter/search
  useEffect(() => {
    if (loading) return;
    setLoadingGrid(true);
    const tmo = setTimeout(() => setLoadingGrid(false), 300);
    return () => clearTimeout(tmo);
  }, [q, tag, sort, loading]);

  const filtered = useMemo(() => {
    let list = [...items];

    if (tag === 'category') list = list.filter((m) => !!m.categoryId);
    if (tag === 'brand') list = list.filter((m) => !!m.brandId);

    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(s) ||
          (m.desc ?? '').toLowerCase().includes(s)
      );
    }

    if (sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'za') list.sort((a, b) => b.title.localeCompare(a.title));

    return list;
  }, [items, q, tag, sort]);

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
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
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
        {!loading && !loadingGrid && (
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
        {loading || loadingGrid ? (
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
                onClick={() => navigate(`/Materials/${m.id}`)}
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
                        navigate(`/Materials/${m.id}`);
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
                      to={`/Materials/${m.id}`}
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

/* Sub components giữ nguyên, không đổi class */
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

function EmptyState({ onReset }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 p-10 text-center">
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {t('materials.catalog.empty_title')}
      </h3>
      <p className="mt-2 text-gray-600">{t('materials.catalog.empty_desc')}</p>
      <button
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium"
      >
        {t('materials.catalog.reset_filters')}
      </button>
    </div>
  );
}
