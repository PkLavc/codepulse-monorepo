import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do ResizeObserver (necessário para alguns componentes)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
