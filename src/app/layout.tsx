import type { Metadata } from 'next'
import { ThemeModeToggle } from '@/components/theme-mode-toggle'
import { ThemeProvider } from '@/components/theme-provider'
import { ToasterProvider } from '@/components/toaster-provider'
import './index.css'

export const metadata: Metadata = {
  title: '背景移除工具 - 一键移除图片背景',
  description: '简单易用的在线背景移除工具，上传图片一键移除背景',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ToasterProvider />
          <ThemeModeToggle className="fixed top-4 right-4" />
        </ThemeProvider>
      </body>
    </html>
  )
}
