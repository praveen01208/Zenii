export function getImgSrc(img: string): string {
  if (!img) return '';
  if (img.startsWith('data:')) return img;
  if (img.startsWith('http')) return img;
  return `${import.meta.env.VITE_API_URL || ''}${img}`;
}
