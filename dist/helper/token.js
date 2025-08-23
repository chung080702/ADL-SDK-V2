"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapSOLInstruction = exports.wrapSOLInstruction = exports.getOrCreateATAInstruction = exports.getTokenDecimals = void 0;
exports.getTokenProgram = getTokenProgram;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
function getTokenProgram(flag) {
    return flag == 0 ? spl_token_1.TOKEN_PROGRAM_ID : spl_token_1.TOKEN_2022_PROGRAM_ID;
}
const getTokenDecimals = async (connection, mint) => {
    return (await (0, spl_token_1.getMint)(connection, mint)).decimals;
};
exports.getTokenDecimals = getTokenDecimals;
const getOrCreateATAInstruction = async (connection, tokenMint, owner, payer = owner, allowOwnerOffCurve = true, tokenProgram) => {
    const toAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(tokenMint, owner, allowOwnerOffCurve, tokenProgram);
    try {
        await (0, spl_token_1.getAccount)(connection, toAccount);
        return { ataPubkey: toAccount, ix: undefined };
    }
    catch (e) {
        if (e instanceof spl_token_1.TokenAccountNotFoundError || e instanceof spl_token_1.TokenInvalidAccountOwnerError) {
            const ix = (0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(payer, toAccount, owner, tokenMint, tokenProgram);
            return { ataPubkey: toAccount, ix };
        }
        else {
            /* handle error */
            console.error('Error::getOrCreateATAInstruction', e);
            throw e;
        }
    }
};
exports.getOrCreateATAInstruction = getOrCreateATAInstruction;
const wrapSOLInstruction = (from, to, amount) => {
    return [
        web3_js_1.SystemProgram.transfer({
            fromPubkey: from,
            toPubkey: to,
            lamports: amount,
        }),
        new web3_js_1.TransactionInstruction({
            keys: [
                {
                    pubkey: to,
                    isSigner: false,
                    isWritable: true,
                },
            ],
            data: Buffer.from(new Uint8Array([17])),
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }),
    ];
};
exports.wrapSOLInstruction = wrapSOLInstruction;
const unwrapSOLInstruction = async (owner, receiver = owner, allowOwnerOffCurve = true) => {
    const wSolATAAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(spl_token_1.NATIVE_MINT, owner, allowOwnerOffCurve);
    if (wSolATAAccount) {
        const closedWrappedSolInstruction = (0, spl_token_1.createCloseAccountInstruction)(wSolATAAccount, receiver, owner, [], spl_token_1.TOKEN_PROGRAM_ID);
        return closedWrappedSolInstruction;
    }
    return null;
};
exports.unwrapSOLInstruction = unwrapSOLInstruction;
//# sourceMappingURL=token.js.map