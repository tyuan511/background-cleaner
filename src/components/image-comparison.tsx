'use client'

import type { MouseEvent } from 'react'

import { Separator } from '@/components/ui/separator'
import { formatSize } from '@/lib/format'
import Image from 'next/image'
import { useRef, useState } from 'react'

interface ImageComparisonProps {
  originalImage: {
    src: string
    file: File
  }
  processedImage: string | null
  className?: string
}

export function ImageComparison({ originalImage, processedImage, className = '' }: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // 处理鼠标移动事件，调整左右图片展示比例
  const handleMouseMove = (e: MouseEvent) => {
    if (!imageContainerRef.current || !processedImage)
      return

    const container = imageContainerRef.current
    const rect = container.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const containerWidth = rect.width
    const percentage = (x / containerWidth) * 100
    setSliderPosition(percentage)
  }

  // 处理鼠标离开事件
  const handleMouseLeave = () => {
    // 当鼠标离开容器时，根据最后位置确定分割线是靠左还是靠右
    if (!processedImage)
      return

    if (sliderPosition < 50) {
      setSliderPosition(0)
    }
    else {
      setSliderPosition(100)
    }
  }

  return (
    <div
      ref={imageContainerRef}
      className={`relative flex-1 w-full bg-muted/30 rounded-lg overflow-hidden ${className}`}
      onMouseMove={processedImage ? handleMouseMove : undefined}
      onMouseLeave={processedImage ? handleMouseLeave : undefined}
      style={{ cursor: processedImage ? 'col-resize' : 'default' }}
    >
      <div
        className="absolute inset-0 z-10"
        style={{
          clipPath: processedImage ? `inset(0 ${100 - sliderPosition}% 0 0)` : 'none',
        }}
      >
        <Image
          src={originalImage.src}
          alt="原始图片"
          fill
          className="object-contain"
        />
        {processedImage && (
          <div className="absolute top-0 right-0 bottom-0 w-1 bg-white shadow-md z-20" />
        )}
      </div>

      {/* 处理后的图片 */}
      {processedImage && (
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)`, backgroundImage: 'url(/checkboard.svg)' }}
        >
          <Image
            src={processedImage}
            alt="处理后的图片"
            fill
            className="object-contain"
          />
        </div>
      )}

      {/* 分割线 */}
      {processedImage && (
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-md z-30 cursor-col-resize"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
            <Separator orientation="vertical" className="h-3 bg-gray-400" />
          </div>
        </div>
      )}

      {/* 图片信息 */}
      <div className="absolute bottom-0 left-2 right-2 flex justify-between text-xs bg-black/50 text-white rounded px-2 py-1 z-40">
        <span>
          {originalImage.file.name}
          {' '}
          (
          {formatSize(originalImage.file.size)}
          )
        </span>
        {processedImage && (
          <span>
            拖动分割线对比效果
          </span>
        )}
      </div>
    </div>
  )
}
