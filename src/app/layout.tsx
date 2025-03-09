import type { Metadata, Viewport } from 'next'
import { ThemeModeToggle } from '@/components/theme-mode-toggle'
import { ThemeProvider } from '@/components/theme-provider'
import { ToasterProvider } from '@/components/toaster-provider'
import './index.css'

const APP_NAME = '图片背景移除器'
const APP_DEFAULT_TITLE = '图片背景移除器 - 一键移除图片背景'
const APP_TITLE_TEMPLATE = '%s - 图片背景移除器'
const APP_DESCRIPTION = '简单易用的在线背景移除工具，上传图片一键移除背景'

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: APP_DEFAULT_TITLE,
  description: APP_DESCRIPTION,
  keywords: ['图片背景移除', '在线背景移除', '一键移除背景', '图片处理', '在线工具'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
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
