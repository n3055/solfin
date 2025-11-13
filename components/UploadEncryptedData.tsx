"use client";

import { useState } from "react";
import { useProgram, getUserDataPDA } from "@/utils/program";
import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";
import toast from "react-hot-toast";
import { Upload, Lock, Key, FileText, Shield, AlertCircle } from "lucide-react";

export function UploadEncryptedData() {
  const [ephPub, setEphPub] = useState("");
  const [nonce, setNonce] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [dataType, setDataType] = useState("text");
  const [fileId, setFileId] = useState("");
  const [userPermit, setUserPermit] = useState("");
  const [loading, setLoading] = useState(false);
  const { program } = useProgram();
  const { publicKey: walletPublicKey, connected } = useWallet();

  const handleUpload = async () => {
    if (!ephPub || !nonce || !ciphertext || !dataType || !fileId || !userPermit) {
      toast.error("All fields are required", {
        style: {
          background: '#000',
          color: '#ff0041',
          border: '1px solid #ff0041',
        },
        icon: '⚠️',
      });
      return;
    }

    if (!connected || !walletPublicKey) {
      toast.error("Wallet not connected", {
        style: {
          background: '#000',
          color: '#ff0041',
          border: '1px solid #ff0041',
        },
        icon: '🔒',
      });
      return;
    }

    if (!program) {
      toast.error("Program not initialized", {
        style: {
          background: '#000',
          color: '#ff0041',
          border: '1px solid #ff0041',
        },
        icon: '❌',
      });
      return;
    }

    // Validate JSON format for userPermit
    try {
      JSON.parse(userPermit);
    } catch (e) {
      toast.error("Invalid JSON format in User Permit field", {
        style: {
          background: '#000',
          color: '#ff0041',
          border: '1px solid #ff0041',
        },
        icon: '⚠️',
      });
      return;
    }

    setLoading(true);
    try {
      const [userDataPDA] = getUserDataPDA(walletPublicKey);

      const tx = await program.methods
        .uploadData(ephPub, nonce, ciphertext, dataType, fileId, userPermit)
        .accounts({
          userData: userDataPDA,
          user: walletPublicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success(`Upload successful! TX: ${tx.slice(0, 8)}...`, {
        style: {
          background: '#000',
          color: '#00ff41',
          border: '1px solid #00ff41',
        },
        icon: '✓',
      });

      // Clear form
      setEphPub("");
      setNonce("");
      setCiphertext("");
      setDataType("text");
      setFileId("");
      setUserPermit("");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message || "Unknown error"}`, {
        style: {
          background: '#000',
          color: '#ff0041',
          border: '1px solid #ff0041',
        },
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = ephPub && nonce && ciphertext && dataType && fileId && userPermit;

  return (
    <div className="space-y-4">
      {/* Connection Warning */}
      {!connected && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-500 font-mono text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>// WALLET NOT CONNECTED - CONNECT TO UPLOAD</span>
        </div>
      )}

      {/* Ephemeral Public Key */}
      <div>
        <label className="flex items-center gap-2 text-xs font-mono text-green-600 mb-2">
          <Key className="w-3 h-3" />
          // EPHEMERAL_PUBLIC_KEY
        </label>
        <input
          type="text"
          value={ephPub}
          onChange={(e) => setEphPub(e.target.value)}
          placeholder="ENTER EPHEMERAL PUBLIC KEY..."
          className="w-full px-3 py-2 bg-black border border-green-500/30 rounded text-green-400 placeholder-green-700 focus:outline-none focus:border-green-500 text-sm font-mono transition-all duration-300"
        />
      </div>

      {/* Nonce */}
      <div>
        <label className="flex items-center gap-2 text-xs font-mono text-green-600 mb-2">
          <Shield className="w-3 h-3" />
          // NONCE
        </label>
        <input
          type="text"
          value={nonce}
          onChange={(e) => setNonce(e.target.value)}
          placeholder="ENTER NONCE VALUE..."
          className="w-full px-3 py-2 bg-black border border-green-500/30 rounded text-green-400 placeholder-green-700 focus:outline-none focus:border-green-500 text-sm font-mono transition-all duration-300"
        />
      </div>

      {/* Ciphertext */}
      <div>
        <label className="flex items-center gap-2 text-xs font-mono text-green-600 mb-2">
          <Lock className="w-3 h-3" />
          // ENCRYPTED_CIPHERTEXT
        </label>
        <textarea
          value={ciphertext}
          onChange={(e) => setCiphertext(e.target.value)}
          placeholder="ENTER ENCRYPTED CIPHERTEXT DATA..."
          rows={4}
          className="w-full px-3 py-2 bg-black border border-green-500/30 rounded text-green-400 placeholder-green-700 focus:outline-none focus:border-green-500 text-sm font-mono resize-none transition-all duration-300 custom-scrollbar"
        />
        <div className="text-green-700 text-xs font-mono mt-1">
          CHARS: {ciphertext.length}
        </div>
      </div>

      {/* Data Type and File ID - Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Data Type */}
        <div>
          <label className="flex items-center gap-2 text-xs font-mono text-green-600 mb-2">
            <FileText className="w-3 h-3" />
            // DATA_TYPE
          </label>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
            className="w-full px-3 py-2 bg-black border border-green-500/30 rounded text-green-400 focus:outline-none focus:border-green-500 text-sm font-mono transition-all duration-300"
          >
            <option value="text" className="bg-black">TEXT</option>
            <option value="image" className="bg-black">IMAGE</option>
            <option value="pdf" className="bg-black">PDF</option>
            <option value="document" className="bg-black">DOCUMENT</option>
            <option value="other" className="bg-black">OTHER</option>
          </select>
        </div>

        {/* File ID */}
        <div>
          <label className="flex items-center gap-2 text-xs font-mono text-green-600 mb-2">
            <FileText className="w-3 h-3" />
            // FILE_ID
          </label>
          <input
            type="text"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            placeholder="FILE IDENTIFIER..."
            className="w-full px-3 py-2 bg-black border border-green-500/30 rounded text-green-400 placeholder-green-700 focus:outline-none focus:border-green-500 text-sm font-mono transition-all duration-300"
          />
        </div>
      </div>

      {/* User Permit */}
      <div>
        <label className="flex items-center gap-2 text-xs font-mono text-green-600 mb-2">
          <Shield className="w-3 h-3" />
          // USER_PERMIT_JSON
        </label>
        <textarea
          value={userPermit}
          onChange={(e) => setUserPermit(e.target.value)}
          placeholder='{"allowed": ["user1", "user2"], "permissions": "read"}'
          rows={3}
          className="w-full px-3 py-2 bg-black border border-green-500/30 rounded text-green-400 placeholder-green-700 focus:outline-none focus:border-green-500 text-sm font-mono resize-none transition-all duration-300 custom-scrollbar"
        />
        <div className="text-green-700 text-xs font-mono mt-1">
          // MUST BE VALID JSON FORMAT
        </div>
      </div>

      {/* Progress Indicator */}
      {loading && (
        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-green-400 font-mono text-sm">UPLOADING DATA TO BLOCKCHAIN...</span>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={loading || !isFormValid || !connected}
        className="w-full bg-green-600/20 hover:bg-green-600/30 disabled:bg-gray-900 disabled:cursor-not-allowed disabled:border-gray-700 border border-green-500 text-green-400 disabled:text-gray-600 font-mono font-semibold py-3 px-4 rounded transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/30"
      >
        <Upload className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
        {loading ? "UPLOADING..." : isFormValid ? "UPLOAD ENCRYPTED DATA" : "FILL ALL FIELDS"}
      </button>

      {/* Form Status */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="text-green-700">
          // FIELDS: <span className={isFormValid ? "text-green-400" : "text-yellow-500"}>
            {[ephPub, nonce, ciphertext, dataType, fileId, userPermit].filter(Boolean).length}/6
          </span>
        </div>
        <div className="text-green-700">
          // STATUS: <span className={connected ? "text-green-400" : "text-red-500"}>
            {connected ? "READY" : "DISCONNECTED"}
          </span>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 255, 65, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 65, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 65, 0.5);
        }
      `}</style>
    </div>
  );
}