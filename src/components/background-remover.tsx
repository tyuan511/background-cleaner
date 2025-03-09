'use client'

import type { BackgroundRemovalPipeline, ProgressInfo, RawImage } from '@huggingface/transformers'

import { Button } from '@/components/ui/button'

import { Label } from '@/components/ui/label'
import { pipeline } from '@huggingface/transformers'
import { CheckIcon, CopyIcon, DownloadIcon, ImageIcon, Loader2, Loader2Icon, UploadIcon } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

import { ImageComparison } from './image-comparison'

interface ImageData {
  src: string
  file: File
  processedSrc?: string | null
}

export function BackgroundRemover() {
  const [images, setImages] = useState<ImageData[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const segmenter = useRef<BackgroundRemovalPipeline>(null)

  // 获取当前选中的图片
  const currentImage = images[currentIndex] || null
  // 获取当前图片的处理结果
  const currentProcessedImage = currentImage?.processedSrc || null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0)
      return

    const newImages: ImageData[] = []

    // 处理多个文件
    Array.from(files).forEach((file) => {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        toast.error(`文件 ${file.name} 不是图片文件，已跳过`)
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        newImages.push({
          src: reader.result as string,
          file,
          processedSrc: null,
        })

        // 当所有文件都读取完成后，更新状态
        if (newImages.length === Array.from(files).filter(f => f.type.startsWith('image/')).length) {
          setImages(prev => [...prev, ...newImages])
          // 如果之前没有图片，设置当前索引为0
          if (images.length === 0) {
            setCurrentIndex(0)
          }
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const newImages: ImageData[] = []

      // 处理多个文件
      Array.from(files).forEach((file) => {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          toast.error(`文件 ${file.name} 不是图片文件，已跳过`)
          return
        }

        const reader = new FileReader()
        reader.onload = () => {
          newImages.push({
            src: reader.result as string,
            file,
            processedSrc: null,
          })

          // 当所有文件都读取完成后，更新状态
          if (newImages.length === Array.from(files).filter(f => f.type.startsWith('image/')).length) {
            setImages(prev => [...prev, ...newImages])
            // 如果之前没有图片，设置当前索引为0
            if (images.length === 0) {
              setCurrentIndex(0)
            }
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const onProgress = useCallback((progressInfo: ProgressInfo) => {
    if (progressInfo && typeof progressInfo === 'object') {
      const { status, file, progress } = progressInfo as { status: string, name: string, file: string, progress?: number }
      // 根据状态更新提示信息
      switch (status) {
        case 'initiate':
          setStatusMessage(`正在初始化模型文件: ${file}`)
          break
        case 'download':
          setStatusMessage(`正在下载模型文件: ${file}`)
          break
        case 'progress':
          setStatusMessage(`正在下载模型文件: ${file} (${Math.round(progress ?? 0)}%)`)
          break
        case 'done':
          setStatusMessage('模型加载完成，正在处理图像')
          break
        case 'ready':
          setStatusMessage('模型已就绪，开始处理图像')
          break
        default:
          setStatusMessage(`处理中: ${status || '未知状态'}`)
      }
    }
  }, [])

  const removeIndexImage = useCallback(async (index: number) => {
    const image = images[index]
    if (!image) {
      return
    }
    setCurrentIndex(index)
    try {
      if (!segmenter.current) {
        segmenter.current = await pipeline('background-removal', 'briaai/RMBG-1.4', {
          progress_callback: onProgress,
          session_options: {
            logSeverityLevel: 3,
          },
          device: 'webgpu',
          dtype: 'fp32',
        })
      }
      else {
        setStatusMessage('模型已就绪，开始处理图像')
      }
      const result = await segmenter.current(URL.createObjectURL(image.file), {
        threshold: 0.5,
      }) as any as RawImage[]

      // 处理结果
      if (result && result.length > 0) {
        const blob = await result[0].toBlob()
        const url = URL.createObjectURL(blob)
        setImages((prev) => {
          const newImages = [...prev]
          newImages[index] = {
            ...newImages[index],
            processedSrc: url,
          }
          return newImages
        })
      }
      else {
        throw new Error('模型未返回有效结果')
      }
    }
    catch (modelError) {
      console.error('模型处理错误:', modelError)
      // 如果模型处理失败，记录错误并通知用户
      const errorMessage = modelError instanceof Error ? modelError.message : '未知错误'
      toast.error(`模型处理失败: ${errorMessage}`)
      console.error('详细错误:', modelError)
    }
  }, [images, onProgress])

  const removeBackground = async () => {
    if (!currentImage)
      return
    setIsProcessing(true)

    try {
      let index = currentIndex
      while (index <= images.length - 1) {
        await removeIndexImage(index)
        index += 1
      }
      setStatusMessage('处理完成')
      toast.success('背景移除成功')
    }
    finally {
      setIsProcessing(false)
    }
  }

  // 切换到指定图片
  const switchToImage = (index: number) => {
    if (index >= 0 && index < images.length && !isProcessing) {
      setCurrentIndex(index)
    }
  }

  const onDownload = useCallback(() => {
    if (!currentProcessedImage || !currentImage)
      return
    const link = document.createElement('a')
    link.href = currentProcessedImage
    link.download = `${currentImage.file.name.split('.')[0]}-no-bg.png`
    link.click()
  }, [currentProcessedImage, currentImage])

  const onCopy = useCallback(async () => {
    if (!currentProcessedImage)
      return

    try {
      const res = await fetch(currentProcessedImage)
      const blob = await res.blob()
      const item = new ClipboardItem({ 'image/png': blob })
      await navigator.clipboard.write([item])
      toast.success('图片已复制到剪贴板')
    }
    catch (err) {
      console.error('复制到剪贴板失败:', err)
      toast.error('复制失败，请重试')
    }
  }, [currentProcessedImage])

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">背景移除工具</h1>
        <p className="text-muted-foreground">
          上传图片，一键移除背景
        </p>
      </div>

      <input
        ref={fileInputRef}
        id="image-upload"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-6">
        <div className="bg-card rounded-lg p-6 pb-10 shadow-sm border relative">
          <div className="flex flex-col gap-4">
            {images.length === 0 && (
              <>
                <Label htmlFor="image-upload" className="text-lg font-semibold">
                  选择图片
                </Label>

                <div
                  className={`h-[320px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragging ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}`}
                  onClick={handleUploadClick}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-4">
                    <UploadIcon className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium">点击或拖拽图片到此处</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        支持多选 JPG, PNG, WebP 格式
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 已上传图片区域 */}
            {images.length > 0 && currentImage && (
              <div className="h-[calc(100vh-400px)] min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    {currentProcessedImage ? '处理结果' : '原始图片'}
                    {` (${currentIndex + 1}/${images.length})`}
                  </h2>
                  <div className="flex items-center gap-2">
                    {currentProcessedImage && (
                      <>
                        <Button size="icon" variant="outline" disabled={isProcessing} onClick={onCopy} title="复制到剪贴板">
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                        <Button size="icon" onClick={onDownload} disabled={isProcessing} title="下载处理后的图片">
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <ImageComparison
                  originalImage={currentImage}
                  processedImage={currentProcessedImage}
                  className="aspect-square"
                />

                <div className="mt-4 overflow-x-auto pb-2">
                  <div className="flex gap-2">
                    {images.map((image, index) => (
                      <div
                        key={image.file.name}
                        className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${index === currentIndex ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                        onClick={() => switchToImage(index)}
                      >
                        <Image
                          src={image.src}
                          alt={image.file.name}
                          fill
                          className="object-cover"
                        />
                        {image.processedSrc && (
                          <div className="size-4 rounded-full bg-primary absolute top-0.5 right-0.5 flex items-center justify-center">
                            <CheckIcon className="text-white" size={12} />
                          </div>
                        )}
                        {
                          isProcessing && currentIndex === index && (
                            <div className="size-4 rounded-full bg-primary absolute top-0.5 right-0.5 flex items-center justify-center">
                              <Loader2Icon className="text-white animate-spin" size={12} />
                            </div>
                          )
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 处理按钮 */}
            {images.length > 0 && currentImage && (
              <Button
                onClick={removeBackground}
                disabled={isProcessing}
                className="w-full mt-4"
              >
                {isProcessing
                  ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        正在处理...
                      </>
                    )
                  : currentProcessedImage
                    ? (
                        <>
                          <ImageIcon className="mr-2 h-4 w-4" />
                          重新处理
                        </>
                      )
                    : (
                        <>
                          <ImageIcon className="mr-2 h-4 w-4" />
                          移除背景
                        </>
                      )}
              </Button>
            )}

            <div className="space-y-2 mt-2 absolute bottom-4 left-1/2 -translate-x-1/2">
              <p className="text-xs text-center text-muted-foreground">
                {statusMessage}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
