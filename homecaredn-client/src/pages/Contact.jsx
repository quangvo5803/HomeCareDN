import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contactSupportService } from '../services/contactSupportService';
import { toast } from 'react-toastify';
import Reveal from '../components/Reveal';

export default function Contact() {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      await contactSupportService.create(form); // service trả thẳng data
      toast.success(t('contact.success_message'));
      setForm({ fullName: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact create failed:', {
        message: error?.message,
        response: error?.response,
      });

      const apiMsg =
        error?.response?.data?.message || error?.response?.data?.error || null;

      toast.error(apiMsg || t('contact.error_message'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <Reveal>
        <div className="relative bg-[url('https://res.cloudinary.com/dl4idg6ey/image/upload/v1749285221/about_upkv2j.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/70"></div>
          <div className="relative container mx-auto text-center py-20 px-6">
            <nav className="flex justify-center text-sm text-gray-300 space-x-2">
              <a href="/" className="hover:text-orange-400">
                {t('header.home')}
              </a>
              <span>/</span>
              <span className="text-orange-500 font-semibold">
                {t('contact.breadcrumb')}
              </span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('contact.title')}
            </h1>
          </div>
        </div>
      </Reveal>

      {/* Contact Section */}
      <section className="container mx-auto max-w-7xl px-6 py-16 flex-1">
        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          {/* Map - Left */}
          <Reveal>
            <div className="h-full min-h-[400px] w-full rounded-lg overflow-hidden shadow">
              <iframe
                className="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51607.267535206294!2d108.22371327808423!3d15.975308097363925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142116949840599%3A0x365b35580f52e8d5!2sFPT%20University%20Danang!5e0!3m2!1sen!2s!4v1756972436573!5m2!1sen!2s"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t('contact.map_title')}
              />
            </div>
          </Reveal>

          {/* Form - Right */}
          <Reveal>
            <div>
              <div className="border-l-4 border-orange-500 pl-4 mb-6">
                <h6 className="uppercase text-gray-600 mb-2">
                  {t('contact.section_tag')}
                </h6>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {t('contact.section_title')}
                </h2>
              </div>

              <p className="text-gray-600 mb-6 text-sm">
                {t('contact.note_prefix')}
              </p>

              <form
                className="grid gap-4"
                aria-label={t('contact.form_aria')}
                onSubmit={handleSubmit}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    type="text"
                    placeholder={t('contact.form.name')}
                    aria-label={t('contact.form.name')}
                    className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                    required
                  />
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder={t('contact.form.email')}
                    aria-label={t('contact.form.email')}
                    className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                    required
                  />
                </div>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  type="text"
                  placeholder={t('contact.form.subject')}
                  aria-label={t('contact.form.subject')}
                  className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                  required
                />
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t('contact.form.message')}
                  aria-label={t('contact.form.message')}
                  rows="5"
                  className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  {loading ? t('BUTTON.Sending') : t('BUTTON.Send')}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
