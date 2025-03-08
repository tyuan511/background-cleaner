import { BackgroundRemover } from '@/components/background-remover'

export default function Home() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <BackgroundRemover />

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          ©
          {new Date().getFullYear()}
          {' '}
          背景移除工具 | 一键移除图片背景
        </p>
      </footer>
    </div>
  )
}
