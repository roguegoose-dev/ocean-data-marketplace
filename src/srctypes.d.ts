// src/types.d.ts

// This declares the 'ethereum' property on the global Window object,
// allowing TypeScript to recognize it without errors.
interface Window {
  ethereum?: any; // Using 'any' for simplicity, but you can use more specific types
                  // like those from '@metamask/providers' or 'web3-eth-typings'
                  // if you need more strict type checking for the Ethereum provider.
}

// If you encounter other global variables or properties that TypeScript
// doesn't recognize, you can declare them here as well.