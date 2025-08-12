
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function SlideViewer({ slides = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  console.log('SlideViewer received slides:', slides)

  if (!slides || slides.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-300 to-purple-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl font-bold mb-2">No slides generated yet</div>
          <div className="text-purple-200">Generate your pitch deck first to see the slides</div>
        </div>
      </div>
    )
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const currentSlideData = slides[currentSlide] || {}

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-300 via-purple-500 to-purple-800 relative overflow-hidden">
      {/* Brand Title */}
      <div className="absolute top-8 left-8 text-white text-3xl font-bold">
        {slides[0]?.startupName || 'Startup'}
      </div>

      {/* Slide Dots */}
      <div className="absolute top-8 right-8 flex gap-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-2 border-purple-500 flex items-center justify-center hover:bg-purple-50 transition-colors"
      >
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-2 border-purple-500 flex items-center justify-center hover:bg-purple-50 transition-colors"
      >
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Main Slide Content */}
      <div className="flex items-center justify-center min-h-screen px-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl"
          >
            {/* Slide Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {currentSlideData.title || 'Slide Title'}
                </h1>
                {currentSlideData.subtitle && (
                  <p className="text-xl text-purple-600 font-medium">
                    {currentSlideData.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Slide Content */}
            <div className="space-y-6">
              {/* Description */}
              {currentSlideData.description && (
                <p className="text-lg text-gray-700 leading-relaxed">
                  {currentSlideData.description}
                </p>
              )}

              {/* Bullet Points */}
              {currentSlideData.bullets && currentSlideData.bullets.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {currentSlideData.bullets.map((bullet, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">{bullet}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Metrics */}
              {currentSlideData.metrics && typeof currentSlideData.metrics === 'object' && (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(currentSlideData.metrics).map(([key, value]) => (
                    <div key={key} className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <div className="text-sm text-purple-600 font-medium">{key}</div>
                      <div className="text-lg text-gray-800 font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-lg font-medium">
        {currentSlide + 1}/{slides.length}
      </div>
    </div>
  )
}
