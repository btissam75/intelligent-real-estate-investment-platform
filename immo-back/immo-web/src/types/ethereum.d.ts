// src/types/ethereum.d.ts
export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      providers?: any[];
      request(args: { method: string; params?: unknown[] }): Promise<any>;
      on?(e: string, cb: (...a: any[]) => void): void;
      removeListener?(e: string, cb: (...a: any[]) => void): void;
    };
  }
}
