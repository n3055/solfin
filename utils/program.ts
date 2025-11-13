import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import idlJson from "@/idl/hello_anchor.json";

export const PROGRAM_ID = new PublicKey(
  "CcoCz8T5pShf5CYHNJHNngWLan2Z6Dz1nbeBWXRyS1VZ"
);

// Type the IDL properly for Anchor
type HelloAnchorIdl = Idl & {
  instructions: Array<any>;
  accounts: Array<any>;
};

export function useProgram() {
  const { publicKey, signTransaction, signAllTransactions, connected, wallet } =
    useWallet();

  const connection = useMemo(
    () => new Connection("https://api.devnet.solana.com", "confirmed"),
    []
  );

  const provider = useMemo(() => {
    // Debug logging
    console.log("useProgram - Provider check:", {
      connected,
      hasPublicKey: !!publicKey,
      hasSignTransaction: !!signTransaction,
      hasSignAllTransactions: !!signAllTransactions,
      hasWallet: !!wallet,
    });

    // Check if wallet is connected and all required functions are available
    if (!connected || !publicKey) {
      return null;
    }

    // Check if sign functions are available
    if (!signTransaction || !signAllTransactions) {
      console.warn("Wallet connected but sign functions not available yet");
      return null;
    }

    try {
      const providerInstance = new AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction,
          signAllTransactions,
        },
        { commitment: "confirmed" }
      );
      console.log("AnchorProvider created successfully");
      return providerInstance;
    } catch (error) {
      console.error("Error creating AnchorProvider:", error);
      return null;
    }
  }, [connected, publicKey, signTransaction, signAllTransactions, connection, wallet]);

  const program = useMemo(() => {
    if (!provider) {
      console.log("useProgram - No provider, returning null");
      return null;
    }
    
    try {
      console.log("useProgram - Initializing Program...");
      
      // Create a complete IDL structure with all fields Anchor expects
      // Anchor v0.30 might require certain optional fields to be present
      const idlComplete: any = {
        version: idlJson.version || "0.1.0",
        name: idlJson.name || "hello_anchor",
        instructions: idlJson.instructions || [],
        accounts: idlJson.accounts || [],
        types: idlJson.types || [],
        events: (idlJson as any).events || [],
        errors: (idlJson as any).errors || [],
        constants: (idlJson as any).constants || [],
        metadata: {
          address: PROGRAM_ID.toString(),
        },
        address: PROGRAM_ID.toString(),
      };
      
      console.log("Complete IDL structure:", idlComplete);
      
      // Try to initialize Program with the complete IDL
      const programInstance = new Program(
        idlComplete as Idl,
        PROGRAM_ID as any,
        provider as any
      );
      
      console.log("Program initialized successfully");
      return programInstance;
    } catch (error: any) {
      console.error("Failed to initialize Program:", error);
      console.error("Error message:", error?.message);
      console.error("Error name:", error?.name);
      console.error("Error stack:", error?.stack);
      
      // Try fallback: use IDL as-is with minimal modifications
      try {
        console.log("Attempting fallback initialization...");
        const idlFallback = {
          ...idlJson,
          address: PROGRAM_ID.toString(),
        };
        const fallbackProgram = new Program(idlFallback as any, PROGRAM_ID as any, provider as any);
        console.log("Fallback Program initialization successful");
        return fallbackProgram;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        return null;
      }
    }
  }, [provider]);

  return { program, provider, connection, publicKey };
}

export function getPubkeyFilePDA(userPublicKey: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("pubkey-file"), userPublicKey.toBuffer()],
    PROGRAM_ID
  );
}

export function getUserDataPDA(userPublicKey: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user-data"), userPublicKey.toBuffer()],
    PROGRAM_ID
  );
}
