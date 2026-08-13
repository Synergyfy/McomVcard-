import { useTranslation } from 'react-i18next'
import type { FrontTestimonial } from '../../types'

interface TestimonialsProps {
  testimonials?: FrontTestimonial[]
}

export default function Testimonials({ testimonials = [] }: TestimonialsProps) {
  const { t } = useTranslation()

  if (testimonials.length === 0) {
    testimonials = [
      { id: 1, name: 'Sarah Johnson', description: 'This platform completely changed how I share my contact information. My clients love the digital card!', testimonial_url: '' },
      { id: 2, name: 'Michael Chen', description: 'The appointment scheduling feature alone is worth it. So easy to use and professional looking.', testimonial_url: '' },
      { id: 3, name: 'Emily Rodriguez', description: 'I switched from paper cards to Mobile VCard Link and I am never going back. The analytics are incredibly useful.', testimonial_url: '' },
    ]
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('testimonials.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-xl p-8 border border-gray-100">
              <div className="flex items-center gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">&ldquo;{item.description}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                  {item.name.charAt(0)}
                </div>
                <span className="font-medium text-gray-900 text-sm">{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
