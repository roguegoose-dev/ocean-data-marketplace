// src/wallet.ts

export async function connectWallet(): Promise<string> {
  // Explicitly cast window to include ethereum property to satisfy TypeScript
  const globalWindow = window as any;

  if (typeof globalWindow.ethereum === 'undefined') {
    throw new Error('MetaMask or other Web3 wallet not detected. Please install one.');
  }

  const accounts = await globalWindow.ethereum.request({ method: 'eth_requestAccounts' });
  if (accounts.length === 0) {
    throw new Error('No accounts found or connected.');
  }

  const account = accounts[0];
  return account;
}