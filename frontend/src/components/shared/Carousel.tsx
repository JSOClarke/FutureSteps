import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from '../../icons'

interface CarouselProps {
    images: {
        src: string
        alt: string
    }[]
    autoPlayInterval?: number
}

export function Carousel({ images, autoPlayInterval = 5000 }: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Auto-play functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, autoPlayInterval)

        return () => clearInterval(interval)
    }, [images.length, autoPlayInterval])

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    return (
        <div className="relative w-full max-w-3xl mx-auto">
            {/* Main Image Display */}
            <div className="relative overflow-hidden border-2 border-black bg-white">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {images.map((image, index) => (
                        <div key={index} className="min-w-full">
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-auto"
                            />
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-2 border-black p-2 transition-colors"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-2 border-black p-2 transition-colors"
                    aria-label="Next slide"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-6">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 border border-black transition-colors ${index === currentIndex ? 'bg-black' : 'bg-white'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
