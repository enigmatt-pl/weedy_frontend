export interface PlatformParameter {
  id: string;
  name: string;
  values: string[];
}

export interface PlatformProduct {
  id: string;
  name: string;
  category?: {
    id: string;
    name: string;
  };
  image_url?: string;
  images?: { url: string }[];
  parameters: PlatformParameter[];
}

export interface PlatformSearchResponse {
  products: PlatformProduct[];
  meta: {
    total: number;
  };
}
