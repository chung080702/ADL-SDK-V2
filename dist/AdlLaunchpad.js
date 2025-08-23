"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdlLaunchpad = void 0;
const web3_js_1 = require("@solana/web3.js");
const defai_launchpad_json_1 = __importDefault(require("./idl/defai_launchpad.json"));
const anchor_1 = require("@coral-xyz/anchor");
const helper_1 = require("./helper");
const spl_token_1 = require("@solana/spl-token");
const invariant_1 = __importDefault(require("invariant"));
class AdlLaunchpad {
    constructor(connection) {
        this._program = new anchor_1.Program(defai_launchpad_json_1.default, {
            connection,
        });
    }
    async prepareTokenAccounts(params) {
        const { payer, tokenMint, tokenOwner, tokenProgram } = params;
        const instructions = [];
        const { ataPubkey, ix } = await (0, helper_1.getOrCreateATAInstruction)(this._program.provider.connection, tokenMint, tokenOwner, payer, true, tokenProgram);
        ix && instructions.push(ix);
        return {
            tokenAta: ataPubkey,
            instructions,
        };
    }
    // ----------------------------- QUERIES -----------------------------
    async loadConfigAccount() {
        if (!this.configAccount) {
            const [configPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('config')], this._program.programId);
            const configAccount = await this._program.account.config.fetchNullable(configPda);
            (0, invariant_1.default)(configAccount, 'Config account not found');
            this.configAccount = configAccount;
        }
        return this.configAccount;
    }
    async loadBondingCurveAccount(tokenMint) {
        const [bondingCurvePda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('bonding_curve'), tokenMint.toBuffer()], this._program.programId);
        const bondingCurveAccount = await this._program.account.bondingCurve.fetchNullable(bondingCurvePda);
        (0, invariant_1.default)(bondingCurveAccount, 'Bonding curve account not found');
        return bondingCurveAccount;
    }
    async getUserInfoByPool(user, poolTokenMint) {
        const [stakingVaultPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('staking_vault_v2'), poolTokenMint.toBytes()], this._program.programId);
        const [stakerInfoPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('staker_info_v2'), stakingVaultPda.toBuffer(), user.toBuffer()], this._program.programId);
        const stakerInfoAccount = await this._program.account.stakerInfoV2.fetchNullable(stakerInfoPda);
        return stakerInfoAccount;
    }
    async simulateSwap(params) {
        const { amountIn, direction, poolTokenMint, provider } = params;
        const program = new anchor_1.Program(defai_launchpad_json_1.default, provider);
        const result = await program.methods
            .simulateSwap(amountIn, direction ? 1 : 0)
            .accounts({
            tokenMint: poolTokenMint,
        })
            .view();
        return result;
    }
    // ----------------------------- INSTRUCTIONS -----------------------------
    async stakeInstruction(params) {
        const { owner, poolTokenMint, amount, stakeTokenMint } = params;
        const ix = await this._program.methods
            .stake(amount)
            .accounts({
            signer: owner,
            stakeCurrencyMint: stakeTokenMint,
            rewardCurrencyMint: poolTokenMint,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        })
            .instruction();
        return ix;
    }
    async unstakeInstruction(params) {
        const { owner, poolTokenMint, amount, stakeTokenMint } = params;
        const ix = await this._program.methods
            .destake(amount)
            .accounts({
            signer: owner,
            stakeCurrencyMint: stakeTokenMint,
            rewardCurrencyMint: poolTokenMint,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        })
            .instruction();
        return ix;
    }
    async swapPartyInstruction(params) {
        const { user, poolTokenMint, amountIn, direction, minimumReceiveAmount, creator, tokenProgram, } = params;
        await this.loadConfigAccount();
        const ix = await this._program.methods
            .buyParty(amountIn, direction ? 1 : 0, minimumReceiveAmount)
            .accounts({
            teamWallet: this.configAccount.teamWallet,
            user: user,
            tokenMint: poolTokenMint,
            creatorWallet: creator,
            tokenProgram: tokenProgram,
        })
            .instruction();
        return ix;
    }
    async swapPublicInstruction(params) {
        const { user, poolTokenMint, amountIn, direction, minimumReceiveAmount, creator, tokenProgram, } = params;
        await this.loadConfigAccount();
        const ix = await this._program.methods
            .swap(amountIn, direction ? 1 : 0, minimumReceiveAmount)
            .accounts({
            teamWallet: this.configAccount.teamWallet,
            user: user,
            tokenMint: poolTokenMint,
            creatorWallet: creator,
            tokenProgram: tokenProgram,
        })
            .instruction();
        return ix;
    }
    async claimTokenInstruction(params) {
        const { owner, poolTokenMint, receiver, tokenProgram } = params;
        const ix = await this._program.methods
            .claimToken()
            .accounts({
            tokenMint: poolTokenMint,
            payer: owner,
            receiver: receiver,
            tokenProgram: tokenProgram,
        })
            .instruction();
        return ix;
    }
}
exports.AdlLaunchpad = AdlLaunchpad;
//# sourceMappingURL=AdlLaunchpad.js.map