import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const TEAL_PRIMARY = '#0D9488';
export const TEAL_LIGHT = '#14B8A6';
export const NAVY_DARK = '#0B132B';
export const NAVY_ACCENT = '#1C2541';
export const ROSE_ACCENT = '#F43F5E';
export const AMBER_ACCENT = '#F59E0B';
export const SLATE_GRID = 'rgba(226, 232, 240, 0.8)';
