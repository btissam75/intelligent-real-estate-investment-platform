// immo-web/src/types/metamask.d.ts
export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request(args: { method: string; params?: any[] | object }): Promise<any>;
      on?(event: string, handler: (...a: any[]) => void): void;
      removeListener?(event: string, handler: (...a: any[]) => void): void;
    };
  }
}
