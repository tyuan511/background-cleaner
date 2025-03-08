export function formatSize(size: number) {
  if (size < 1024)
    return `${size} B`

  const units = ['KB', 'MB', 'GB', 'TB']
  let i = 0
  let formattedSize = size / 1024

  while (formattedSize >= 1024 && i < units.length - 1) {
    formattedSize /= 1024
    i++
  }

  return `${formattedSize.toFixed(2)} ${units[i]}`
}
