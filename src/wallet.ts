// src/wallet.ts

export async function connectWallet(): Promise<string> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask or other Web3 wallet not detected. Please install one.');
  }

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (accounts.length === 0) {
    throw new Error('No accounts found or connected.');
  }

  const account = accounts[0];
  return account;
}