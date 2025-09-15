import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { materialService } from '../services/materialService';

export default function MaterialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [material, setMaterial] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        if (!id) throw new Error('Missing id');

        const res = await materialService.getMaterialById(id);
        const data = res?.data ?? res;
        const nm = normalizeMaterial(data);
        if (mounted) setMaterial(nm);

        const listRes = await materialService.getAllMaterial();
        const list = Array.isArray(listRes) ? listRes : listRes?.data ?? [];
        const relatedNm = list
          .map(normalizeMaterial)
          .filter((x) => x.id != null && String(x.id) !== String(id))
          .slice(0, 4);
        if (mounted) setRelated(relatedNm);
      } catch (e) {
        console.error(e);
        if (mounted) setError('Failed to load material');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-red-600">{error}</p>
        <Link to="/MaterialsCatalog" className="text-orange-600 font-medium">
          {t('materials.detail.back_to_list')}
        </Link>
      </main>
    );
  }

  if (!material) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-gray-600">{t('materials.detail.not_found')}</p>
        <Link to="/MaterialsCatalog" className="text-orange-600 font-medium">
          {t('materials.detail.back_to_list')}
        </Link>
      </main>
    );
  }

  return (
    <main>
      <section className="relative h-[46vh] md:h-[56vh]">
        <img
          src={material.img}
          alt={material.title}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
          <nav className="text-white/85 text-sm mb-2" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white">
              {t('materials.catalog.breadcrumbs_home')}
            </Link>
            <span className="mx-2">/</span>
            <Link to="/MaterialsCatalog" className="hover:text-white">
              {t('materials.catalog.breadcrumbs_materials')}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white font-semibold">{material.title}</span>
          </nav>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5 self-start">
          <div className="rounded-2xl overflow-hidden">
            <img
              src={material.img}
              alt={material.title}
              className="w-full aspect-[1/1] object-cover"
            />
          </div>

          {material.images?.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {material.images.slice(0, 4).map((src, i) => (
                <button
                  key={i}
                  className="rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label={`${material.title} thumbnail ${i + 1}`}
                  onClick={() => setMaterial((prev) => ({ ...prev, img: src }))}
                >
                  <img
                    src={src}
                    alt={`${material.title} thumbnail ${i + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:col-span-7 lg:pl-4 self-start">
          <div className="lg:sticky lg:top-20 h-fit space-y-6">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {material.title}
              </h2>
              <p className="mt-2 text-gray-600">{material.desc}</p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow"
                  onClick={() => {}}
                >
                  {t('materials.detail.cta_add_new_request')}
                </button>
                <button
                  className="px-5 py-2.5 rounded-xl bg-white ring-1 ring-black/10 hover:ring-black/20 text-gray-900 font-semibold"
                  onClick={() => {}}
                >
                  {t('materials.detail.cta_add_to_existing')}
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="border-b flex">
                <button className="px-4 md:px-6 py-3 text-sm font-medium text-orange-600 border-b-2 border-orange-500">
                  {t('materials.detail.description_tab')}
                </button>
              </div>
              <div className="p-6 text-gray-600">
                <p>
                  {t('materials.detail.description_tab')} —{' '}
                  <strong>{material.title}</strong>.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-14">
        <div className="flex items-end justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {t('materials.detail.related_title')}
          </h3>
          <Link
            to="/MaterialsCatalog"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            {t('home.material_more', 'More Materials')} →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((m) => (
            <article
              key={m.id}
              onClick={() => navigate(`/Materials/${m.id}`)}
              className="group cursor-pointer bg-white rounded-2xl shadow-sm ring-1 ring-black/5 hover:ring-orange-500 hover:shadow-md transition overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img
                  src={m.img}
                  alt={m.title}
                  className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ring-2 ring-inset ring-orange-500/20 pointer-events-none" />
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition">
                  {m.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">{m.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
