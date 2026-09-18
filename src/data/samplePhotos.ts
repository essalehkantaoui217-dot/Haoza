import { SampleProductPhoto } from '../types';

export const SAMPLE_PRODUCT_PHOTOS: SampleProductPhoto[] = [
  {
    id: 'sample-watch',
    name: 'Automatic Chronograph Watch',
    category: 'Jewelry & Watches',
    url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
    originalDescription: 'Luxury mechanical chronograph watch on textured rough wooden surface with reflections on crystal.',
    suggestedPrompt: 'Remove background, clean dust and glare from watch crystal, isolate on pure white background with soft realistic contact shadow.',
  },
  {
    id: 'sample-sneaker',
    name: 'Performance Running Sneaker',
    category: 'Footwear',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
    originalDescription: 'Vibrant red sneaker on textured gray street background with minor sole smudges.',
    suggestedPrompt: 'Remove background completely, clean up scuffs on white rubber sole, isolate sneaker on pure #FFFFFF e-commerce white background.',
  },
  {
    id: 'sample-headphones',
    name: 'Wireless Studio Headphones',
    category: 'Consumer Tech',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    originalDescription: 'Black over-ear headphones placed on yellow tabletop with yellow accessories.',
    suggestedPrompt: 'Remove yellow background and surrounding clutter, place headphones on sleek minimal brushed dark stone pedestal with studio edge lighting.',
  },
  {
    id: 'sample-perfume',
    name: 'Eau de Parfum Glass Bottle',
    category: 'Beauty & Cosmetics',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
    originalDescription: 'Glass perfume bottle with light glare, dust particles and textured background.',
    suggestedPrompt: 'Clean up glass reflections and surface dust, isolate perfume bottle on transparent background with crisp edges and glowing gold liquid.',
  },
  {
    id: 'sample-mug',
    name: 'Ceramic Artisan Mug',
    category: 'Home & Kitchen',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    originalDescription: 'Dark speckled ceramic mug on wooden breakfast table with coffee beans and crumbs.',
    suggestedPrompt: 'Remove wooden table and coffee crumbs, isolate ceramic mug on warm minimalist beige studio surface with natural morning window light.',
  },
];
