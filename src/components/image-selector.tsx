import { UploadIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

interface Props {
  onChange: (files: File[]) => void
}

export function ImageSelector({ onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0)
      return

    const images: File[] = []
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`文件 ${file.name} 不是图片文件，已跳过`)
        return
      }
      images.push(file)
    })
    onChange(images)
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
      const images: File[] = []
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) {
          toast.error(`文件 ${file.name} 不是图片文件，已跳过`)
          return
        }
        images.push(file)
      })

      onChange(images)
    }
  }

  return (
    <>
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
      <input
        ref={fileInputRef}
        id="image-upload"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  )
}
