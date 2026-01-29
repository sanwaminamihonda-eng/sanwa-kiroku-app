import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => '',
}));

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  getFirebaseApp: vi.fn(),
  getFirebaseAuth: vi.fn(),
  getFirebaseDb: vi.fn(),
}));
