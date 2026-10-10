// Vercel Functions reject request bodies over 4.5 MB, so every image is shrunk
// in the browser to keep 3 images plus text comfortably under that limit.
export const MAX_UPLOAD_BYTES_PER_IMAGE = 1.2 * 1024 * 1024

const MAX_DIMENSION = 1600
const QUALITY_STEPS = [0.85, 0.75, 0.65, 0.5]

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file)
    } catch {
      // Fall through to <img>, which some browsers (e.g. Safari for HEIC) decode better.
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}

export async function compressImage(file: File): Promise<File> {
  let source: ImageBitmap | HTMLImageElement
  try {
    source = await decode(file)
  } catch {
    if (file.size <= MAX_UPLOAD_BYTES_PER_IMAGE) return file
    throw new Error(`Gambar "${file.name}" tidak bisa diproses. Coba pakai format JPG atau PNG.`)
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(source.width, source.height))
  const width = Math.round(source.width * scale)
  const height = Math.round(source.height * scale)

  if (scale === 1 && file.size <= MAX_UPLOAD_BYTES_PER_IMAGE && file.type !== 'image/heic' && file.type !== 'image/heif') {
    if ('close' in source) source.close()
    return file
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Browser tidak mendukung pemrosesan gambar.')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(source, 0, 0, width, height)
  if ('close' in source) source.close()

  for (const quality of QUALITY_STEPS) {
    const blob = await toBlob(canvas, quality)
    if (blob && blob.size <= MAX_UPLOAD_BYTES_PER_IMAGE) {
      const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
      return new File([blob], name, { type: 'image/jpeg', lastModified: file.lastModified })
    }
  }

  throw new Error(`Gambar "${file.name}" terlalu besar untuk dikirim.`)
}
