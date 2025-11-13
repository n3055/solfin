"use client";

import { useState } from "react";
import { useProgram, getPubkeyFilePDA } from "@/utils/program";
import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";
import toast from "react-hot-toast";
import { Upload, User, FileKey, AlertCircle, CheckCircle, X } from "lucide-react";

export function UploadPubKeyFile() {
  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { program } = useProgram();
  const { publicKey: walletPublicKey, connected } = useWallet();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (10KB = 10240 bytes)
      if (selectedFile.size > 10240) {
        toast.error("File exceeds 10 KB limit", {
          style: {
            background: '#000',
            color: '#ff0041',
            border: '1px solid #ff0041',
          },
          icon: '⚠️',
        });
        return;
      }

      // Validate file type (optional - add if needed)
      const validExtensions = ['.pub', '.pem', '.key', '.txt'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.some(ext => fileExtension === ext)) {
        toast.error("Invalid file type. Use .pub, .pem, .key, or .txt", {
          style: {
            background: '#000',
            color: '#ff0041',
            border: '1px solid #ff0041',
          },
          icon: '⚠️',
        });
        return;
      }

      setFile(selectedFile);
      toast.success("File loaded successfully", {
        style: {
          background: '#000',
          color: '#00ff41',
          border: '1px solid #00ff41',
        },
        icon: '✓',
      });
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleUpload = async () => {
    if (!file || !username.trim()) {
      toast.error("Username and file are required", {
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
      console.error("Program is null. Debug info:", {
        connected,
        hasWalletPublicKey: !!walletPublicKey,
        program,
      });
      toast.error("Program not initialized. Please refresh the page.", {
        style: {
          background: '#000',
          color: '#ff0041',
          border: '1px solid #ff0041',
        },
        icon: '❌',
      });
      return;
    }

    setLoading(true);
    try {
      const fileBuffer = await file.arrayBuffer();
      const fileBytes = Array.from(new Uint8Array(fileBuffer));

      const [pubkeyFilePDA] = getPubkeyFilePDA(walletPublicKey);

      const tx = await program.methods
        .uploadPubkeyFile(fileBytes, username)
        .accounts({
          pubkeyFile: pubkeyFilePDA,
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
      setFile(null);
      setUsername("");
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
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

  const isFormValid = file && username.trim().length > 0;
  const fileSizeKB = file ? (file.size / 1024).toFixed(2) : "0";
  const fileSizePercent = file ? Math.min((file.size / 10240) * 100, 100) : 0;

  return (
    <div className="space-y-4">
      {/* Connection Warning */}
      {!connected && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-500 font-mono text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>// WALLET NOT CONNECTED - CONNECT TO UPLOAD</span>
        </div>
      )}

      {/* Username Input */}
      <div>
        <label className="flex items-center gap-2 text-xs font-mono text-green-600 mb-2">
          <User className="w-3 h-3" />
          // USERNAME
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="ENTER USERNAME..."
          className="w-full px-3 py-2 bg-black border border-green-500/30 rounded text-green-400 placeholder-green-700 focus:outline-none focus:border-green-500 text-sm font-mono transition-all duration-300"
          maxLength={64}
        />
        <div className="flex items-center justify-between text-xs font-mono mt-1">
          <span className="text-green-700">// MAX 64 CHARS</span>
          <span className={`${username.length > 50 ? 'text-yellow-500' : 'text-green-700'}`}>
            {username.length}/64
          </span>
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="flex items-center gap-2 text-xs font-mono text-green-600 mb-2">
          <FileKey className="w-3 h-3" />
          // PUBLIC_KEY_FILE
        </label>
        
        {/* File Input Button */}
        <div className="relative">
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            accept=".pub,.pem,.key,.txt"
            className="hidden"
          />
          <label
            htmlFor="file-input"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600/10 border-2 border-dashed border-green-500/30 rounded text-green-400 hover:border-green-500/60 hover:bg-green-600/20 cursor-pointer transition-all duration-300 font-mono text-sm"
          >
            <Upload className="w-4 h-4" />
            {file ? "CHANGE FILE" : "SELECT FILE TO UPLOAD"}
          </label>
        </div>

        {/* File Info Display */}
        {file && (
          <div className="mt-3 p-3 bg-green-500/5 border border-green-500/30 rounded space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-green-400 font-mono text-sm truncate">
                    {file.name}
                  </span>
                </div>
                <div className="text-green-600 font-mono text-xs">
                  SIZE: {fileSizeKB} KB / 10.00 KB
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-1 hover:bg-red-500/20 rounded transition-colors flex-shrink-0"
                title="Remove file"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>

            {/* File Size Progress Bar */}
            <div className="space-y-1">
              <div className="h-1 bg-green-900/30 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    fileSizePercent > 90 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${fileSizePercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-green-700">// FILE SIZE</span>
                <span className={fileSizePercent > 90 ? 'text-yellow-500' : 'text-green-500'}>
                  {fileSizePercent.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="text-green-700 text-xs font-mono mt-2">
          // ACCEPTED: .pub, .pem, .key, .txt | MAX: 10 KB
        </div>
      </div>

      {/* Progress Indicator */}
      {loading && (
        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-green-400 font-mono text-sm">UPLOADING TO BLOCKCHAIN...</span>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={loading || !isFormValid || !connected}
        className="w-full bg-green-600/20 hover:bg-green-600/30 disabled:bg-gray-900 disabled:cursor-not-allowed disabled:border-gray-700 border border-green-500 text-green-400 disabled:text-gray-600 font-mono font-semibold py-3 px-4 rounded transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/30"
      >
        <Upload className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
        {loading ? "UPLOADING..." : isFormValid ? "UPLOAD PUBLIC KEY" : "SELECT FILE & USERNAME"}
      </button>

      {/* Form Status */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="text-green-700">
          // REQUIREMENTS: <span className={isFormValid ? "text-green-400" : "text-yellow-500"}>
            {[file, username.trim()].filter(Boolean).length}/2
          </span>
        </div>
        <div className="text-green-700">
          // STATUS: <span className={connected ? "text-green-400" : "text-red-500"}>
            {connected ? "READY" : "DISCONNECTED"}
          </span>
        </div>
      </div>
    </div>
  );
}