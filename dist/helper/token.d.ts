import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
export declare function getTokenProgram(flag: number): PublicKey;
export declare const getTokenDecimals: (connection: Connection, mint: PublicKey) => Promise<number>;
export declare const getOrCreateATAInstruction: (connection: Connection, tokenMint: PublicKey, owner: PublicKey, payer: PublicKey | undefined, allowOwnerOffCurve: boolean | undefined, tokenProgram: PublicKey) => Promise<{
    ataPubkey: PublicKey;
    ix?: TransactionInstruction;
}>;
export declare const wrapSOLInstruction: (from: PublicKey, to: PublicKey, amount: bigint) => TransactionInstruction[];
export declare const unwrapSOLInstruction: (owner: PublicKey, receiver?: PublicKey, allowOwnerOffCurve?: boolean) => Promise<TransactionInstruction | null>;
