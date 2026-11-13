import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
  isCoinbaseWallet?: boolean;
  isMetaMask?: boolean;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const BASE_SEPOLIA_CHAIN_ID = '0x14a34';

function App() {
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState('');
  const [walletName, setWalletName] = useState('');
  const [status, setStatus] = useState('Wallet not connected');

  const provider = () => window.ethereum;

  const refreshWallet = async () => {
    const ethereum = provider();
    if (!ethereum) return;
    const accounts = (await ethereum.request({ method: 'eth_accounts' })) as string[];
    const chain = (await ethereum.request({ method: 'eth_chainId' })) as string;
    setAddress(accounts?.[0] ?? '');
    setChainId(chain ?? '');
    if (accounts?.[0]) {
      setWalletName(ethereum.isCoinbaseWallet ? 'Coinbase Wallet' : ethereum.isMetaMask ? 'MetaMask' : 'EVM wallet');
      setStatus('Wallet connected');
    }
  };

  useEffect(() => {
    const ethereum = provider();
    if (!ethereum) return;
    const onAccounts = (accounts: unknown) => setAddress(Array.isArray(accounts) ? String(accounts[0] ?? '') : '');
    const onChain = (chain: unknown) => setChainId(String(chain ?? ''));
    void refreshWallet();
    ethereum.on?.('accountsChanged', onAccounts);
    ethereum.on?.('chainChanged', onChain);
    return () => {
      ethereum.removeListener?.('accountsChanged', onAccounts);
      ethereum.removeListener?.('chainChanged', onChain);
    };
  }, []);

  const connectWallet = async () => {
    const ethereum = provider();
    if (!ethereum) {
      setStatus('No wallet provider detected. Open this site inside the Coinbase Wallet app browser or MetaMask browser, then try again.');
      return;
    }
    try {
      setStatus('Waiting for wallet approval…');
      const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      const chain = (await ethereum.request({ method: 'eth_chainId' })) as string;
      setAddress(accounts?.[0] ?? '');
      setChainId(chain ?? '');
      setWalletName(ethereum.isCoinbaseWallet ? 'Coinbase Wallet' : ethereum.isMetaMask ? 'MetaMask' : 'EVM wallet');
      setStatus('Wallet connected. No transaction was requested.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Wallet connection was cancelled or failed.');
    }
  };

  const switchToBaseSepolia = async () => {
    const ethereum = provider();
    if (!ethereum) {
      setStatus('Open Zicron inside your wallet app browser first.');
      return;
    }
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });
      setChainId(BASE_SEPOLIA_CHAIN_ID);
      setStatus('Switched to Base Sepolia.');
    } catch (error) {
      const code = (error as { code?: number })?.code;
      if (code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BASE_SEPOLIA_CHAIN_ID,
              chainName: 'Base Sepolia',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://sepolia.base.org'],
              blockExplorerUrls: ['https://sepolia.basescan.org'],
            }],
          });
          setChainId(BASE_SEPOLIA_CHAIN_ID);
          setStatus('Base Sepolia added to your wallet.');
        } catch (addError) {
          setStatus(addError instanceof Error ? addError.message : 'Could not add Base Sepolia.');
        }
      } else {
        setStatus(error instanceof Error ? error.message : 'Network switch was cancelled or failed.');
      }
    }
  };

  const openCoinbaseWallet = () => {
    const deepLink = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`;
    window.location.href = deepLink;
  };

  const onBaseSepolia = chainId.toLowerCase() === BASE_SEPOLIA_CHAIN_ID;

  return (
    <main style={{ maxWidth: 680, margin: '48px auto', padding: 24, fontFamily: 'Arial, sans-serif', color: '#f7f7f7', background: '#101114', borderRadius: 20 }}>
      <p style={{ color: '#9ca3af', letterSpacing: 2, fontSize: 12 }}>ZICRON WALLET</p>
      <h1>Zicron (ZCR)</h1>
      <p>Connect your wallet to prepare for the Zicron testnet experience.</p>

      <section style={{ border: '1px solid #34363d', borderRadius: 16, padding: 20, marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>Wallet connection</h2>
        <button onClick={() => void connectWallet()} style={buttonStyle}>Connect wallet</button>
        <button onClick={openCoinbaseWallet} style={secondaryButtonStyle}>Open in Coinbase Wallet</button>
        <p><strong>Status:</strong> {status}</p>
        {address && <p><strong>Wallet:</strong> {walletName}<br /><code>{address}</code></p>}
        {address && <p><strong>Network:</strong> {onBaseSepolia ? 'Base Sepolia' : `Chain ID ${chainId || 'unknown'}`}</p>}
        {address && !onBaseSepolia && <button onClick={() => void switchToBaseSepolia()} style={buttonStyle}>Switch to Base Sepolia</button>}
        {address && onBaseSepolia && <p style={{ color: '#8be0a1' }}>Connected to Base Sepolia testnet.</p>}
      </section>

      <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.6, marginTop: 24 }}>
        Safety: connecting only shares your public wallet address. This page does not ask for your recovery phrase or private key and does not send transactions.
      </p>
      {import.meta.env.PROD && <Analytics />}
      {import.meta.env.PROD && <SpeedInsights />}
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '14px 18px', margin: '12px 0',
  border: 0, borderRadius: 10, background: '#315bff', color: '#fff',
  fontSize: 16, fontWeight: 700, cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle, background: '#292c35', border: '1px solid #555966',
};

export default App;
