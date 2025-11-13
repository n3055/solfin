"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { UsernameList } from "@/components/UsernameList";
import { EncryptedDataList } from "@/components/EncryptedDataList";
import { UploadPubKeyFile } from "@/components/UploadPubKeyFile";
import { UploadEncryptedData } from "@/components/UploadEncryptedData";
import { Shield, Database, Key, Lock } from "lucide-react";

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Matrix Background */}
        <div className="absolute inset-0 opacity-20">
          <MatrixRain />
        </div>

        {/* Login Card */}
        <div className="relative z-10 bg-black/90 border border-green-500/30 rounded-lg shadow-2xl shadow-green-500/20 p-12 max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-5xl font-bold text-green-500 mb-2 tracking-wider font-mono">
              SOLFIN
            </h1>
            <div className="h-px bg-gradient-to-r from-transparent via-green-500 to-transparent mb-4" />
            <p className="text-green-400/80 text-sm font-mono tracking-wide">
              SECURE FILE STORAGE ON SOLANA BLOCKCHAIN
            </p>
            <p className="text-green-600 text-xs font-mono mt-2">
              // DECENTRALIZED • ENCRYPTED • IMMUTABLE
            </p>
          </div>
          
          <div className="flex justify-center">
            <WalletMultiButton className="!bg-green-600/20 hover:!bg-green-600/30 !border !border-green-500 !text-green-400 !rounded !h-12 !px-8 !font-mono !tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50" />
          </div>

          <div className="mt-8 text-center text-green-600 text-xs font-mono">
            <p>CONNECT WALLET TO ACCESS SYSTEM</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Matrix Background */}
      <div className="absolute inset-0 opacity-10">
        <MatrixRain />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 pb-6 border-b border-green-500/30">
          <div>
            <h1 className="text-5xl font-bold text-green-500 mb-2 tracking-wider font-mono flex items-center gap-3">
              <Shield className="w-10 h-10" />
              SOLFIN
            </h1>
            <p className="text-green-600 text-sm font-mono">
              // BLOCKCHAIN FILE STORAGE SYSTEM
            </p>
          </div>
          <WalletMultiButton className="!bg-green-600/20 hover:!bg-green-600/30 !border !border-green-500 !text-green-400 !rounded !font-mono transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50" />
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/90 border border-green-500/30 rounded-lg p-6 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded">
                <Key className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-green-400 font-mono tracking-wide">
                  PUBLIC KEY UPLOAD
                </h2>
                <p className="text-green-600 text-xs font-mono">// STORE PUBLIC KEY FILE</p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-green-500/50 via-green-500/20 to-transparent mb-6" />
            <UploadPubKeyFile />
          </div>

          <div className="bg-black/90 border border-green-500/30 rounded-lg p-6 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded">
                <Lock className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-green-400 font-mono tracking-wide">
                  ENCRYPTED DATA UPLOAD
                </h2>
                <p className="text-green-600 text-xs font-mono">// STORE ENCRYPTED FILE</p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-green-500/50 via-green-500/20 to-transparent mb-6" />
            <UploadEncryptedData />
          </div>
        </div>

        {/* Data Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-black/90 border border-green-500/30 rounded-lg p-6 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded">
                <Database className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-green-400 font-mono tracking-wide">
                  USERNAMES & PUBLIC KEYS
                </h2>
                <p className="text-green-600 text-xs font-mono">// REGISTERED IDENTITIES</p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-green-500/50 via-green-500/20 to-transparent mb-6" />
            <UsernameList />
          </div>

          <div className="bg-black/90 border border-green-500/30 rounded-lg p-6 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded">
                <Lock className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-green-400 font-mono tracking-wide">
                  ENCRYPTED DATA
                </h2>
                <p className="text-green-600 text-xs font-mono">// STORED FILES</p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-green-500/50 via-green-500/20 to-transparent mb-6" />
            <EncryptedDataList />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center border-t border-green-500/30 pt-6">
          <p className="text-green-600 text-xs font-mono">
            SYSTEM STATUS: <span className="text-green-500">OPERATIONAL</span> • 
            NETWORK: <span className="text-green-500">SOLANA</span> • 
            ENCRYPTION: <span className="text-green-500">ACTIVE</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Matrix Rain Effect Component
function MatrixRain() {
  return (
    <div className="w-full h-full flex overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <MatrixColumn key={i} index={i} />
      ))}
    </div>
  );
}

function MatrixColumn({ index }: { index: number }) {
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const columnChars = chars.split('').sort(() => Math.random() - 0.5).join('').substring(0, 30);
  
  const delay = Math.random() * 5;
  const duration = 3 + Math.random() * 2;
  
  return (
    <div
      className="flex-shrink-0 text-green-500 font-mono text-sm whitespace-nowrap opacity-80"
      style={{
        width: '20px',
        animation: `fall ${duration}s linear infinite`,
        animationDelay: `-${delay}s`,
        writingMode: 'vertical-lr',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(0,255,65,0.9) 5%, rgba(0,255,65,0.8) 15%, rgba(0,255,65,0.6) 30%, rgba(0,255,65,0.4) 50%, rgba(0,255,65,0.2) 70%, transparent 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {columnChars}
    </div>
  );
}

// Add keyframes to your global CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes fall {
    0% {
      transform: translateY(-100%);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);