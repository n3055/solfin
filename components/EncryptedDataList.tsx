"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import { RefreshCw, Search, FileText, Shield, Eye, Copy, Check } from "lucide-react";

const PROGRAM_ID = new PublicKey(
  "CcoCz8T5pShf5CYHNJHNngWLan2Z6Dz1nbeBWXRyS1VZ"
);
function getPubkeyFilePDA(userPublicKey: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("pubkey-file"), userPublicKey.toBuffer()],
    PROGRAM_ID
  );
}

function getUserDataPDA(userPublicKey: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user-data"), userPublicKey.toBuffer()],
    PROGRAM_ID
  );
}

interface UserData {
  owner: string;
  ephPub: string;
  nonce: string;
  ciphertext: string;
  dataType: string;
  fileId: string;
  userPermit: string;
}

export function EncryptedDataList() {
  const [encryptedDataList, setEncryptedDataList] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  const fetchAllEncryptedData = async () => {
    setLoading(true);
    try {
      const accounts = await connection.getProgramAccounts(PROGRAM_ID);
      const decodedAccounts: UserData[] = [];

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
            const [expectedPDA] = getUserDataPDA(new PublicKey(owner));
            if (!expectedPDA.equals(account.pubkey)) {
              continue;
            }
          } catch {
            continue;
          }

          let offset = ownerStart + 32;

          // Read ephPub
          if (data.length < offset + 4) continue;
          const ephPubLength = data.readUInt32LE(offset);
          offset += 4;
          if (data.length < offset + ephPubLength) continue;
          const ephPub = data
            .slice(offset, offset + ephPubLength)
            .toString("utf-8");
          offset += ephPubLength;

          // Read nonce
          if (data.length < offset + 4) continue;
          const nonceLength = data.readUInt32LE(offset);
          offset += 4;
          if (data.length < offset + nonceLength) continue;
          const nonce = data
            .slice(offset, offset + nonceLength)
            .toString("utf-8");
          offset += nonceLength;

          // Read ciphertext
          if (data.length < offset + 4) continue;
          const ciphertextLength = data.readUInt32LE(offset);
          offset += 4;
          if (data.length < offset + ciphertextLength) continue;
          const ciphertext = data
            .slice(offset, offset + ciphertextLength)
            .toString("utf-8");
          offset += ciphertextLength;

          // Read dataType
          if (data.length < offset + 4) continue;
          const dataTypeLength = data.readUInt32LE(offset);
          offset += 4;
          if (data.length < offset + dataTypeLength) continue;
          const dataType = data
            .slice(offset, offset + dataTypeLength)
            .toString("utf-8");
          offset += dataTypeLength;

          // Read fileId
          if (data.length < offset + 4) continue;
          const fileIdLength = data.readUInt32LE(offset);
          offset += 4;
          if (data.length < offset + fileIdLength) continue;
          const fileId = data
            .slice(offset, offset + fileIdLength)
            .toString("utf-8");
          offset += fileIdLength;

          // Read userPermit
          if (data.length < offset + 4) continue;
          const userPermitLength = data.readUInt32LE(offset);
          offset += 4;
          if (data.length < offset + userPermitLength) continue;
          const userPermit = data
            .slice(offset, offset + userPermitLength)
            .toString("utf-8");

          decodedAccounts.push({
            owner,
            ephPub,
            nonce,
            ciphertext,
            dataType,
            fileId,
            userPermit,
          });
        } catch (err) {
          continue;
        }
      }

      setEncryptedDataList(decodedAccounts);
      toast.success(`Loaded ${decodedAccounts.length} encrypted files`, {
        style: {
          background: '#000',
          color: '#00ff41',
          border: '1px solid #00ff41',
        },
      });
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error(`Failed to fetch encrypted data: ${error.message}`, {
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
    fetchAllEncryptedData();
  }, []);

  const filteredList = encryptedDataList.filter(
    (item) =>
      item.fileId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dataType.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            placeholder="SEARCH: FILE_ID | TYPE | OWNER..."
            className="w-full pl-10 pr-4 py-2 bg-black border border-green-500/30 rounded text-green-400 placeholder-green-600 focus:outline-none focus:border-green-500 font-mono text-sm tracking-wide transition-all duration-300"
          />
        </div>
        <button
          onClick={fetchAllEncryptedData}
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
          // TOTAL_RECORDS: <span className="text-green-400">{encryptedDataList.length}</span>
        </div>
        <div className="text-green-600">
          // FILTERED: <span className="text-green-400">{filteredList.length}</span>
        </div>
        <div className="text-green-600">
          // STATUS: <span className="text-green-400 animate-pulse">●</span> ACTIVE
        </div>
      </div>

      {/* Data List */}
      <div className="max-h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 border border-green-500/20 rounded bg-green-500/5">
            <FileText className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-green-600 font-mono text-sm">
              {loading ? "// LOADING DATA..." : "// NO ENCRYPTED DATA FOUND"}
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
              {/* Header */}
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-green-500/20">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-green-400 font-mono text-sm font-semibold">
                      {item.fileId}
                    </div>
                    <div className="text-green-700 font-mono text-xs mt-0.5">
                      // FILE_ID
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded text-xs font-mono tracking-wide">
                  {item.dataType}
                </span>
              </div>

              {/* Owner */}
              <div className="mb-3">
                <div className="text-green-600 font-mono text-xs mb-1">// OWNER</div>
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

              {/* Details Expandable */}
              <details className="mt-3">
                <summary className="text-green-500 font-mono text-xs cursor-pointer hover:text-green-400 transition-colors flex items-center gap-2 select-none">
                  <Eye className="w-4 h-4" />
                  VIEW_ENCRYPTED_DETAILS
                </summary>
                <div className="mt-3 space-y-3 pl-6 border-l-2 border-green-500/20">
                  {/* Ephemeral Pub */}
                  <div>
                    <div className="text-green-600 font-mono text-xs mb-1">
                      // EPHEMERAL_PUBLIC_KEY
                    </div>
                    <div className="flex items-start gap-2 bg-black border border-green-500/20 rounded p-2">
                      <span className="text-green-400 font-mono text-xs break-all flex-1">
                        {item.ephPub}
                      </span>
                      <button
                        onClick={() => copyToClipboard(item.ephPub, `eph-${index}`)}
                        className="p-1 hover:bg-green-500/20 rounded transition-colors flex-shrink-0"
                      >
                        {copiedField === `eph-${index}` ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-green-600 hover:text-green-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Nonce */}
                  <div>
                    <div className="text-green-600 font-mono text-xs mb-1">// NONCE</div>
                    <div className="flex items-start gap-2 bg-black border border-green-500/20 rounded p-2">
                      <span className="text-green-400 font-mono text-xs break-all flex-1">
                        {item.nonce}
                      </span>
                      <button
                        onClick={() => copyToClipboard(item.nonce, `nonce-${index}`)}
                        className="p-1 hover:bg-green-500/20 rounded transition-colors flex-shrink-0"
                      >
                        {copiedField === `nonce-${index}` ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-green-600 hover:text-green-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Ciphertext */}
                  <div>
                    <div className="text-green-600 font-mono text-xs mb-1">
                      // ENCRYPTED_DATA
                    </div>
                    <div className="bg-black border border-green-500/20 rounded p-2">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-green-700 font-mono text-xs flex-1">
                          LENGTH: {item.ciphertext.length} CHARS
                        </span>
                        <button
                          onClick={() => copyToClipboard(item.ciphertext, `cipher-${index}`)}
                          className="p-1 hover:bg-green-500/20 rounded transition-colors flex-shrink-0"
                        >
                          {copiedField === `cipher-${index}` ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-green-600 hover:text-green-400" />
                          )}
                        </button>
                      </div>
                      <div className="text-green-400 font-mono text-xs break-all max-h-24 overflow-y-auto custom-scrollbar pr-2">
                        {item.ciphertext.substring(0, 200)}
                        {item.ciphertext.length > 200 && (
                          <span className="text-green-600">...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Permit */}
                  <div>
                    <div className="text-green-600 font-mono text-xs mb-1">
                      // USER_PERMIT
                    </div>
                    <div className="bg-black border border-green-500/20 rounded p-2">
                      <div className="flex items-start gap-2">
                        <div className="text-green-400 font-mono text-xs break-all max-h-24 overflow-y-auto custom-scrollbar pr-2 flex-1">
                          {item.userPermit}
                        </div>
                        <button
                          onClick={() => copyToClipboard(item.userPermit, `permit-${index}`)}
                          className="p-1 hover:bg-green-500/20 rounded transition-colors flex-shrink-0"
                        >
                          {copiedField === `permit-${index}` ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-green-600 hover:text-green-400" />
                          )}
                        </button>
                      </div>
                    </div>
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