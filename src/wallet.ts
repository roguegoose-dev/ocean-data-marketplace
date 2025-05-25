interface EthereumWindow extends Window {
  ethereum?: any
}
declare const window: EthereumWindow

export async function connectWallet(): Promise<string> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Wallet not found')
  }

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  return accounts[0]
}
