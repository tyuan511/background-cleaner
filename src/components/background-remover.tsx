'use client'

import type { RawImage } from '@huggingface/transformers'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { pipeline } from '@huggingface/transformers'
import { ArrowRightLeftIcon, DownloadIcon, Image as ImageIcon, Loader2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { ImageComparison } from './image-comparison'

interface ImageData {
  src: string
  file: File
}

export function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setOriginalImage({
        src: reader.result as string,
        file,
      })
      setProcessedImage(null)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const removeBackground = async () => {
    if (!originalImage)
      return

    setProcessedImage(null)
    setIsProcessing(true)

    try {
      // 加载模型并处理图像
      try {
        const segmenter = await pipeline('background-removal', 'briaai/RMBG-1.4', {
          progress_callback: (progressInfo) => {
            // 根据不同的状态显示相应提示
            if (progressInfo && typeof progressInfo === 'object') {
              const { status, file, progress } = progressInfo as { status: string, name: string, file: string, progress?: number }
              console.log(progressInfo)
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
                  // 如果是其他状态，显示状态名称
                  setStatusMessage(`处理中: ${status || '未知状态'}`)
              }
            }
          },
          session_options: {
            logSeverityLevel: 3,
          },
          device: 'webgpu',
          dtype: 'fp32',
        })

        // 类型断言，因为我们知道imageSegmenter接受字符串URL作为输入
        const result = await segmenter(URL.createObjectURL(originalImage.file), {
          threshold: 0.5,
        }) as any as RawImage[]

        // 处理结果
        if (result) {
          console.log(result[0])
          const blob = await result[0].toBlob()
          const url = URL.createObjectURL(blob)
          setProcessedImage(url)
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

      setStatusMessage('处理完成')
      toast.success('背景移除成功')
    }
    catch (error) {
      toast.error('处理失败，请重试')
      console.error('背景移除失败:', error)
      setStatusMessage('')
    }
    finally {
      setIsProcessing(false)
    }
  }

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
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-6">
        <div className="bg-card rounded-lg p-6 pb-10 shadow-sm border relative">
          <div className="flex flex-col gap-4">
            {/* 图片上传区域 - 当没有图片时显示 */}
            {!originalImage && (
              <>
                <Label htmlFor="image-upload" className="text-lg font-semibold">
                  选择图片
                </Label>

                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={handleUploadClick}
                >
                  <div className="flex flex-col items-center gap-4">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium">点击或拖拽上传图片</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        支持 JPG, PNG, WebP 格式
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 已上传图片区域 */}
            {originalImage && (
              <div className="h-[calc(100vh-400px)] min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    {processedImage ? '原图与结果对比' : '原始图片'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUploadClick}
                    >
                      <ArrowRightLeftIcon className="mr-2 h-4 w-4" />
                      更换图片
                    </Button>
                    {processedImage && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = processedImage
                          link.download = `${originalImage.file.name.split('.')[0]}-no-bg.png`
                          link.click()
                        }}
                      >
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        下载
                      </Button>
                    )}
                  </div>
                </div>

                <ImageComparison
                  originalImage={originalImage}
                  processedImage={processedImage}
                  className="aspect-square"
                />
              </div>
            )}

            {/* 处理按钮 */}
            {originalImage && (
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
                  : processedImage
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
