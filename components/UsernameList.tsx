"use client";

import { useState, useEffect } from "react";
import { useProgram } from "@/utils/program";
import { Connection, PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import { PROGRAM_ID, getPubkeyFilePDA } from "@/utils/program";
import { RefreshCw, Search, User, Key, Copy, Check, Eye, Database } from "lucide-react";

interface PubKeyFile {
  owner: string;
  fileData: number[];
  userName: string;
}

export function UsernameList() {
  const [usernameList, setUsernameList] = useState<
    Array<{
      username: string;
      owner: string;
      pubkeyBytes: number[];
    }>
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  const fetchAllUsernames = async () => {
    setLoading(true);
    try {
      const accounts = await connection.getProgramAccounts(PROGRAM_ID);

      const decodedAccounts: Array<{
        username: string;
        owner: string;
        pubkeyBytes: number[];
      }> = [];

      for (const account of accounts) {
        try {
          const data = account.account.data;
          
          if (data.length < 8) continue;

          const ownerStart = 8;
          if (data.length < ownerStart + 32) continue;
          
          const ownerBytes = data.slice(ownerStart, ownerStart + 32);
          let owner: string;
          try {
            owner = new PublicKey(ownerBytes).toBase58();
          } catch {
            continue;
          }

          try {
            const [expectedPDA] = getPubkeyFilePDA(new PublicKey(owner));
            if (!expectedPDA.equals(account.pubkey)) {
              continue;
            }
          } catch {
            continue;
          }

          const fileDataLengthStart = ownerStart + 32;
          if (data.length < fileDataLengthStart + 4) continue;
          
          const fileDataLength = data.readUInt32LE(fileDataLengthStart);
          const fileDataStart = fileDataLengthStart + 4;
          if (data.length < fileDataStart + fileDataLength) continue;
          
          const fileDataBytes = Array.from(
            data.slice(fileDataStart, fileDataStart + fileDataLength)
          );

          const userNameStart = fileDataStart + fileDataLength;
          if (data.length < userNameStart + 4) continue;
          
          const userNameLength = data.readUInt32LE(userNameStart);
          if (data.length < userNameStart + 4 + userNameLength) continue;
          
          const userName = data
            .slice(userNameStart + 4, userNameStart + 4 + userNameLength)
            .toString("utf-8");

          decodedAccounts.push({
            username: userName,
            owner,
            pubkeyBytes: fileDataBytes,
          });
        } catch (err) {
          continue;
        }
      }

      setUsernameList(decodedAccounts);
      toast.success(`Loaded ${decodedAccounts.length} identities`, {
        style: {
          background: '#000',
          color: '#00ff41',
          border: '1px solid #00ff41',
        },
      });
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error(`Failed to fetch usernames: ${error.message}`, {
        style: {
          background: '#000',
          color: '#ff0041',
          border: '1px solid #ff0041',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsernames();
  }, []);

  const filteredList = usernameList.filter((item) =>
    item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard', {
      style: {
        background: '#000',
        color: '#00ff41',
        border: '1px solid #00ff41',
      },
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatBytes = (bytes: number[]) => {
    if (bytes.length === 0) return "NO_DATA";
    const preview = bytes.slice(0, 20).join(", ");
    return bytes.length > 20 ? `[${preview}...] (${bytes.length} bytes)` : `[${preview}] (${bytes.length} bytes)`;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH: USERNAME | OWNER..."
            className="w-full pl-10 pr-4 py-2 bg-black border border-green-500/30 rounded text-green-400 placeholder-green-600 focus:outline-none focus:border-green-500 font-mono text-sm tracking-wide transition-all duration-300"
          />
        </div>
        <button
          onClick={fetchAllUsernames}
          disabled={loading}
          className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 disabled:bg-gray-800 disabled:cursor-not-allowed border border-green-500 text-green-400 rounded font-mono text-sm tracking-wide transition-all duration-300 flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/30"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? "SYNC..." : "REFRESH"}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-green-500/5 border border-green-500/20 rounded font-mono text-xs">
        <div className="text-green-600">
          // TOTAL_IDENTITIES: <span className="text-green-400">{usernameList.length}</span>
        </div>
        <div className="text-green-600">
          // FILTERED: <span className="text-green-400">{filteredList.length}</span>
        </div>
        <div className="text-green-600">
          // STATUS: <span className="text-green-400 animate-pulse">●</span> ACTIVE
        </div>
      </div>

      {/* User List */}
      <div className="max-h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 border border-green-500/20 rounded bg-green-500/5">
            <Database className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-green-600 font-mono text-sm">
              {loading ? "// LOADING IDENTITIES..." : "// NO IDENTITIES FOUND"}
            </p>
            {!loading && searchTerm && (
              <p className="text-green-700 font-mono text-xs mt-2">
                // TRY DIFFERENT SEARCH TERMS
              </p>
            )}
          </div>
        ) : (
          filteredList.map((item, index) => (
            <div
              key={index}
              className="bg-black border border-green-500/30 rounded p-4 hover:border-green-500/60 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group"
            >
              {/* Header - Username */}
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-green-500/20">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-green-400 font-mono text-base font-semibold">
                      {item.username}
                    </div>
                    <div className="text-green-700 font-mono text-xs mt-0.5">
                      // USER_IDENTITY
                    </div>
                  </div>
                </div>
                <div className="px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded text-xs font-mono">
                  ID_{index.toString().padStart(3, '0')}
                </div>
              </div>

              {/* Owner Public Key */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-green-600 font-mono text-xs mb-1">
                  <Key className="w-3 h-3" />
                  // OWNER_PUBLIC_KEY
                </div>
                <div className="flex items-center gap-2 bg-green-500/5 border border-green-500/20 rounded p-2">
                  <span className="text-green-400 font-mono text-xs break-all flex-1">
                    {item.owner}
                  </span>
                  <button
                    onClick={() => copyToClipboard(item.owner, `owner-${index}`)}
                    className="p-1 hover:bg-green-500/20 rounded transition-colors flex-shrink-0"
                  >
                    {copiedField === `owner-${index}` ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-green-600 hover:text-green-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Public Key Bytes - Expandable */}
              <details className="mt-3">
                <summary className="text-green-500 font-mono text-xs cursor-pointer hover:text-green-400 transition-colors flex items-center gap-2 select-none">
                  <Eye className="w-4 h-4" />
                  VIEW_PUBLIC_KEY_DATA
                </summary>
                <div className="mt-3 pl-6 border-l-2 border-green-500/20">
                  <div className="bg-black border border-green-500/20 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-green-600 font-mono text-xs">
                        // RAW_BYTES
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-700 font-mono text-xs">
                          LENGTH: {item.pubkeyBytes.length}
                        </span>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(item.pubkeyBytes), `bytes-${index}`)}
                          className="p-1 hover:bg-green-500/20 rounded transition-colors"
                        >
                          {copiedField === `bytes-${index}` ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-green-600 hover:text-green-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {item.pubkeyBytes.length > 0 ? (
                      <div className="space-y-2">
                        {/* Byte Array Display */}
                        <div className="text-green-400 font-mono text-xs break-all max-h-32 overflow-y-auto custom-scrollbar p-2 bg-green-500/5 rounded">
                          {formatBytes(item.pubkeyBytes)}
                        </div>
                        
                        {/* Hex Preview */}
                        <div className="pt-2 border-t border-green-500/20">
                          <div className="text-green-600 font-mono text-xs mb-1">
                            // HEX_PREVIEW
                          </div>
                          <div className="text-green-400 font-mono text-xs break-all max-h-20 overflow-y-auto custom-scrollbar p-2 bg-green-500/5 rounded">
                            {item.pubkeyBytes.slice(0, 32).map(b => b.toString(16).padStart(2, '0')).join(' ')}
                            {item.pubkeyBytes.length > 32 && <span className="text-green-600"> ...</span>}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-green-700 font-mono text-xs text-center py-4">
                        // NO_DATA_AVAILABLE
                      </div>
                    )}
                  </div>
                </div>
              </details>
            </div>
          ))
        )}
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