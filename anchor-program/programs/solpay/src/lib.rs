use anchor_lang::prelude::*;
use anchor_lang::solana_program::{system_instruction, program::invoke};
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solpay {
    use super::*;

    // Send SOL from payer to recipient
    pub fn send_sol(
        ctx: Context<SendSol>,
        amount: u64,  // in lamports (1 SOL = 1_000_000_000 lamports)
    ) -> Result<()> {
        // Transfer SOL using system program
        invoke(
            &system_instruction::transfer(
                &ctx.accounts.payer.key(),
                &ctx.accounts.recipient.key(),
                amount,
            ),
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.recipient.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        msg!("Transferred {} lamports to {}", amount, ctx.accounts.recipient.key());
        Ok(())
    }

    // Send SPL tokens from payer to recipient
    pub fn send_spl_tokens(
        ctx: Context<SendSplTokens>,
        amount: u64,  // token amount (decimals depend on the mint)
    ) -> Result<()> {
        // Transfer tokens using SPL Token Program
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.payer_token_account.to_account_info(),
                    to: ctx.accounts.recipient_token_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ),
            amount,
        )?;

        msg!("Transferred {} tokens to {}", amount, ctx.accounts.recipient.key());
        Ok(())
    }
}

// Accounts for SOL transfer
#[derive(Accounts)]
pub struct SendSol<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,      // Who sends the SOL
    #[account(mut)]
    /// CHECK: Recipient can be any account
    pub recipient: AccountInfo<'info>, // Who receives the SOL
    pub system_program: Program<'info, System>,
}

// Accounts for SPL Token transfer
#[derive(Accounts)]
pub struct SendSplTokens<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,      // Token sender
    pub mint: Account<'info, Mint>, // Token mint (e.g., USDC, etc.)

    // Payer's token account
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub payer_token_account: Account<'info, TokenAccount>,

    // Recipient's token account
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = recipient
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,

    /// CHECK: Recipient wallet (not signed, just for derivation)
    pub recipient: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
