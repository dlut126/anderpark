export type ThemeDecor = 'trees' | 'buildings' | 'waves' | 'stars';

export interface ParkTheme {
  id: string;
  name: string;
  cost: number;
  unlockLevel?: number;
  skyMono: string;
  skyColor: string;
  groundMono: string;
  groundColor: string;
  decor: ThemeDecor;
}

export const PARK_THEMES: ParkTheme[] = [
  {
    id: 'classic',
    name: 'Classic Park',
    cost: 0,
    skyMono: 'linear-gradient(to bottom, #8a8a8a 0%, #c2c2c2 55%, #eeeeee 100%)',
    skyColor: 'linear-gradient(to bottom, #4d7fc9 0%, #7fb3e0 55%, #d9edd0 100%)',
    groundMono: '#dcdcdc',
    groundColor: '#8fc76a',
    decor: 'trees',
  },
  {
    id: 'city',
    name: 'City Skyline',
    cost: 150,
    unlockLevel: 3,
    skyMono: 'linear-gradient(to bottom, #5a5a66 0%, #9a9aa8 55%, #cfcfd8 100%)',
    skyColor: 'linear-gradient(to bottom, #2c3e6b 0%, #6b7fb0 55%, #e8a87c 100%)',
    groundMono: '#9a9aa0',
    groundColor: '#6a6a72',
    decor: 'buildings',
  },
  {
    id: 'beach',
    name: 'Beach',
    cost: 150,
    unlockLevel: 3,
    skyMono: 'linear-gradient(to bottom, #a8a8a8 0%, #d8d8d8 55%, #f2f2f2 100%)',
    skyColor: 'linear-gradient(to bottom, #6ec6d9 0%, #a8e0e8 55%, #fdf0c0 100%)',
    groundMono: '#e8e2d0',
    groundColor: '#f0dca0',
    decor: 'waves',
  },
  {
    id: 'night',
    name: 'Night Sky',
    cost: 200,
    unlockLevel: 5,
    skyMono: 'linear-gradient(to bottom, #1a1a22 0%, #3a3a48 60%, #5a5a68 100%)',
    skyColor: 'linear-gradient(to bottom, #0a0a2a 0%, #1a1a4a 55%, #2f2a5a 100%)',
    groundMono: '#4a4a52',
    groundColor: '#2f3a2f',
    decor: 'stars',
  },
];

export function getTheme(id: string): ParkTheme | undefined {
  return PARK_THEMES.find((t) => t.id === id);
}
