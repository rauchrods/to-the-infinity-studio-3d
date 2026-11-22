export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  client?: string;
  imageSrc: string;
  description?: string;
  aspect?: 'portrait' | 'landscape' | 'square';
  featured?: boolean;
}

export interface WallArtworkPosition {
  item: GalleryItem;
  wall: 'left' | 'right' | 'end';
  x: number;
  y: number;
  z: number;
  rotationY: number;
  width: number;
  height: number;
  frameIndex: number;
}
