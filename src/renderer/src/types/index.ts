export interface Photo {
  id: string;
  url: string;
  albumId: string;
  date: string;
  title: string;
}

export interface Album {
  id: string;
  title: string;
  coverImage: string;
}

export interface CartItem {
  photoId: string;
  photo: Photo;
  filterName?: string;
  filterClass?: string;
  format: PhotoFormat;
}

export interface FilteredPhoto {
  id: string;
  original_photo_id: string;
  title: string;
  url: string;
  filter_name: string;
  filter_class: string;
  created_at: string;
  user_id: string;
}

export type PhotoFormat = '13x18' | '15x21' | '20x30' | '30x40' | 'email';