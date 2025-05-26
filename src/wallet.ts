// src/wallet.ts
export async function connectWallet(): Promise<string> {
  const globalWindow = window as any; // Explicitly cast window to any

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