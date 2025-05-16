use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::invoke,
    system_instruction,
    clock::Clock,  // Added missing import
};
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod stickypay {
    use super::*;

    pub fn initialize_merchant(ctx: Context<InitializeMerchant>, name: String, fee_basis_points: u16) -> Result<()> {
        require!(fee_basis_points <= 1000, ErrorCode::FeeTooHigh); // Max 10% fee

        let merchant = &mut ctx.accounts.merchant;
        merchant.authority = ctx.accounts.authority.key();
        merchant.name = name;
        merchant.fee_basis_points = fee_basis_points;
        merchant.total_payments = 0;
        merchant.total_volume = 0;
        merchant.bump = *ctx.bumps.get("merchant").unwrap();
        
        msg!("Merchant initialized: {}", merchant.name);
        Ok(())
    }

    pub fn create_payment_session(
        ctx: Context<CreatePaymentSession>, 
        amount: u64, 
        reference: Pubkey,
        memo: String,
        expiry_timestamp: i64,
        token_mint: Option<Pubkey>,
    ) -> Result<()> {
        let payment = &mut ctx.accounts.payment;
        let merchant = &ctx.accounts.merchant;
        let clock = Clock::get()?;
        
        require!(expiry_timestamp > clock.unix_timestamp, ErrorCode::InvalidExpiry);
        
        payment.merchant = merchant.key();
        payment.amount = amount;
        payment.reference = reference;
        payment.memo = memo;
        payment.created_at = clock.unix_timestamp;
        payment.expires_at = expiry_timestamp;
        payment.paid = false;
        payment.cancelled = false;
        payment.token_mint = token_mint;
        payment.bump = *ctx.bumps.get("payment").unwrap();
        
        if let Some(mint) = token_mint {
            msg!("Payment session created for {} tokens of mint {}", amount, mint);
        } else {
            msg!("Payment session created for {} lamports", amount);
        }
        
        Ok(())
    }

    pub fn process_sol_payment(ctx: Context<ProcessSolPayment>) -> Result<()> {
        let payment = &mut ctx.accounts.payment;
        let merchant = &mut ctx.accounts.merchant;
        let clock = Clock::get()?;
        
        // Check if payment is already processed
        require!(!payment.paid, ErrorCode::PaymentAlreadyProcessed);
        
        // Check if payment is expired
        require!(clock.unix_timestamp <= payment.expires_at, ErrorCode::PaymentExpired);
        
        // Ensure this is a SOL payment (no token mint)
        require!(payment.token_mint.is_none(), ErrorCode::InvalidPaymentType);
        
        // Calculate fee if applicable
        let fee_amount = if merchant.fee_basis_points > 0 {
            merchant.fee_basis_points
                .checked_mul(payment.amount as u16)
                .and_then(|v| v.checked_div(10000))
                .ok_or(ErrorCode::FeeTooHigh)? as u64
        } else {
            0
        };
        
        let merchant_amount = payment.amount
            .checked_sub(fee_amount)
            .ok_or(ErrorCode::FeeTooHigh)?;
        
        // Transfer SOL from payer to merchant
        invoke(
            &system_instruction::transfer(
                &ctx.accounts.payer.key(),
                &ctx.accounts.merchant_wallet.key(),
                merchant_amount,
            ),
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.merchant_wallet.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        
        // If there's a fee, transfer to fee collector
        if fee_amount > 0 {
            invoke(
                &system_instruction::transfer(
                    &ctx.accounts.payer.key(),
                    &ctx.accounts.fee_collector.key(),
                    fee_amount,
                ),
                &[
                    ctx.accounts.payer.to_account_info(),
                    ctx.accounts.fee_collector.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
            )?;
        }
        
        // Update payment status
        payment.paid = true;
        payment.paid_at = Some(clock.unix_timestamp);
        payment.payer = Some(ctx.accounts.payer.key());
        
        // Update merchant stats
        merchant.total_payments = merchant.total_payments.checked_add(1).ok_or(ErrorCode::MathOverflow)?;
        merchant.total_volume = merchant.total_volume.checked_add(payment.amount).ok_or(ErrorCode::MathOverflow)?;
        
        msg!("SOL payment processed successfully");
        Ok(())
    }

    pub fn process_token_payment(ctx: Context<ProcessTokenPayment>) -> Result<()> {
        let payment = &mut ctx.accounts.payment;
        let merchant = &mut ctx.accounts.merchant;
        let clock = Clock::get()?;
        
        // Check if payment is already processed
        require!(!payment.paid, ErrorCode::PaymentAlreadyProcessed);
        
        // Check if payment is expired
        require!(clock.unix_timestamp <= payment.expires_at, ErrorCode::PaymentExpired);
        
        // Ensure this is a token payment 
        let token_mint = payment.token_mint.ok_or(ErrorCode::InvalidPaymentType)?; // Safer unwrap
        
        // Verify mint matches
        require!(token_mint == ctx.accounts.mint.key(), ErrorCode::TokenMintMismatch);
        
        // Calculate fee with overflow checks
        let fee_amount = merchant.fee_basis_points
            .checked_mul(payment.amount as u16)
            .and_then(|v| v.checked_div(10000))
            .ok_or(ErrorCode::FeeTooHigh)? as u64;  // Safer math

        let merchant_amount = payment.amount
            .checked_sub(fee_amount)
            .ok_or(ErrorCode::FeeTooHigh)?;  // Checked subtraction

        // Transfer tokens
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer_token_account.to_account_info(),
                to: ctx.accounts.merchant_token_account.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, merchant_amount)?;

        // Transfer fee if > 0
        if fee_amount > 0 {
            let fee_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.payer_token_account.to_account_info(),
                    to: ctx.accounts.fee_collector_token_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            );
            token::transfer(fee_ctx, fee_amount)?;
        }

        // Update state
        payment.paid = true;
        payment.paid_at = Some(clock.unix_timestamp);
        payment.payer = Some(ctx.accounts.payer.key());
        
        merchant.total_payments = merchant.total_payments.checked_add(1).ok_or(ErrorCode::MathOverflow)?;
        merchant.total_volume = merchant.total_volume.checked_add(payment.amount).ok_or(ErrorCode::MathOverflow)?;
        
        msg!("Token payment processed successfully");
        Ok(())
    }

    pub fn cancel_payment(ctx: Context<CancelPayment>) -> Result<()> {
        let payment = &mut ctx.accounts.payment;
        let clock = Clock::get()?;
        
        // Check if payment is already processed
        require!(!payment.paid, ErrorCode::PaymentAlreadyProcessed);
        require!(!payment.cancelled, ErrorCode::PaymentAlreadyCancelled);
        
        // Only merchant authority can cancel before expiry
        if clock.unix_timestamp <= payment.expires_at {
            require!(
                ctx.accounts.authority.key() == ctx.accounts.merchant.authority,
                ErrorCode::Unauthorized
            );
        }
        
        // Mark as cancelled
        payment.cancelled = true;
        payment.cancelled_at = Some(clock.unix_timestamp);
        
        msg!("Payment cancelled");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, fee_basis_points: u16)]
pub struct InitializeMerchant<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + name.len() + 2 + 8 + 8 + 1,
        seeds = [b"merchant", authority.key().as_ref()],
        bump
    )]
    pub merchant: Account<'info, Merchant>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, reference: Pubkey, memo: String, expiry_timestamp: i64, token_mint: Option<Pubkey>)]
pub struct CreatePaymentSession<'info> {
    #[account(
        mut,
        seeds = [b"merchant", authority.key().as_ref()],
        bump = merchant.bump,
        has_one = authority,
    )]
    pub merchant: Account<'info, Merchant>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 32 + 4 + memo.len() + 8 + 8 + 1 + 1 + 8 + 32 + 8 + 33, // +33 for Option<Pubkey>
        seeds = [b"payment", merchant.key().as_ref(), reference.as_ref()],
        bump
    )]
    pub payment: Account<'info, Payment>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessSolPayment<'info> {
    #[account(
        mut,
        seeds = [b"merchant", merchant.authority.as_ref()],
        bump = merchant.bump,
    )]
    pub merchant: Account<'info, Merchant>,
    
    #[account(
        mut,
        seeds = [b"payment", merchant.key().as_ref(), payment.reference.as_ref()],
        bump = payment.bump,
        constraint = payment.merchant == merchant.key(),
        constraint = payment.paid == false,
        constraint = payment.cancelled == false,
    )]
    pub payment: Account<'info, Payment>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// CHECK: This is the merchant's wallet that will receive the payment
    #[account(mut, constraint = merchant_wallet.key() == merchant.authority)]
    pub merchant_wallet: AccountInfo<'info>,
    
    /// CHECK: This is the fee collector wallet
    #[account(mut)]
    pub fee_collector: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessTokenPayment<'info> {
    #[account(
        mut,
        seeds = [b"merchant", merchant.authority.as_ref()],
        bump = merchant.bump,
        has_one = authority,  // Added has_one check
    )]
    pub merchant: Account<'info, Merchant>,
    
    #[account(
        mut,
        seeds = [b"payment", merchant.key().as_ref(), payment.reference.as_ref()],
        bump = payment.bump,
        constraint = payment.merchant == merchant.key(),
        constraint = payment.paid == false,
        constraint = payment.cancelled == false,
    )]
    pub payment: Account<'info, Payment>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        mut,
        associated_token::mint = mint,  // Using associated token macro
        associated_token::authority = payer
    )]
    pub payer_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = merchant.authority
    )]
    pub merchant_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = fee_collector
    )]
    pub fee_collector_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: Fee collector address
    pub fee_collector: AccountInfo<'info>,
    
    /// CHECK: Merchant authority
    pub authority: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelPayment<'info> {
    #[account(
        seeds = [b"merchant", merchant.authority.as_ref()],
        bump = merchant.bump,
    )]
    pub merchant: Account<'info, Merchant>,
    
    #[account(
        mut,
        seeds = [b"payment", merchant.key().as_ref(), payment.reference.as_ref()],
        bump = payment.bump,
        constraint = payment.merchant == merchant.key(),
        constraint = payment.paid == false,
        constraint = payment.cancelled == false,
    )]
    pub payment: Account<'info, Payment>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Merchant {
    pub authority: Pubkey,
    pub name: String,
    pub fee_basis_points: u16,
    pub total_payments: u64,
    pub total_volume: u64,
    pub bump: u8,
}

#[account]
pub struct Payment {
    pub merchant: Pubkey,
    pub amount: u64,
    pub reference: Pubkey,
    pub memo: String,
    pub created_at: i64,
    pub expires_at: i64,
    pub paid: bool,
    pub cancelled: bool,
    pub paid_at: Option<i64>,
    pub payer: Option<Pubkey>,
    pub cancelled_at: Option<i64>,
    pub token_mint: Option<Pubkey>,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Fee basis points cannot exceed 1000 (10%)")]
    FeeTooHigh,
    #[msg("Payment has already been processed")]
    PaymentAlreadyProcessed,
    #[msg("Payment has expired")]
    PaymentExpired,
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Invalid expiry timestamp")]
    InvalidExpiry,
    #[msg("Invalid payment type")]
    InvalidPaymentType,
    #[msg("Token mint mismatch")]
    TokenMintMismatch,
    #[msg("Payment has already been cancelled")]
    PaymentAlreadyCancelled,
    #[msg("Math overflow error")]
    MathOverflow,
}
