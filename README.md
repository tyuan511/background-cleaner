# Background Remover

_[中文文档](README_ZH.md)_

## Project Overview

Background Remover is a web-based application that helps users quickly and easily remove backgrounds from images. The application uses advanced AI models to accurately identify foreground objects in images and generate images with transparent backgrounds.

## Live Demo

Online demo: [https://rmbg.tangge.me](https://rmbg.tangge.me)

## Key Features

- **One-click Background Removal**: Simply upload an image and click to remove the background
- **Batch Processing**: Support for uploading and processing multiple images at once
- **Real-time Preview**: Compare original and processed images side by side
- **Multiple Export Options**:
  - Copy to clipboard
  - Download individual processed images
  - Download all processed images as a ZIP file

## Tech Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **UI Components**: React 19, Shadcn UI, Radix UI
- **Styling**: Tailwind CSS
- **AI Model**: Hugging Face Transformers.js (RMBG-1.4)
- **PWA Support**: Offline functionality with Serwist
- **Other Tools**: TypeScript, JSZip

## Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Features

- **Fully Client-side Processing**: All image processing happens in the browser, no images are uploaded to servers
- **Responsive Design**: Adapts to various device screen sizes
- **PWA Support**: Can be installed as a local application with offline support
- **High Performance**: Leverages WebGPU for model inference acceleration (when available)
