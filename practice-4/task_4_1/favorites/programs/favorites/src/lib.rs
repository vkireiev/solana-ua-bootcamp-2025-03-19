use anchor_lang::prelude::*;

declare_id!("8qSMqYppjhEyFoYK51oLP9xxfx5YPY2tW6JE4AE2wtWg");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[account]
#[derive(InitSpace)]
pub struct Favorites {
    pub number: u64,
    #[max_len(50)]
    pub color: String,
}

#[derive(Accounts)]
pub struct SetFavorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Favorites::INIT_SPACE,
        seeds = [b"favorites", user.key().as_ref()],
        bump,
    )]
    pub favorites: Account<'info, Favorites>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFavorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"favorites", user.key().as_ref()],
        bump,
    )]
    pub favorites: Account<'info, Favorites>,
}

#[program]
pub mod favorites {
    use super::*;

    pub fn set_favorites(context: Context<SetFavorites>, number: u64, color: String) -> Result<()> {
        let user_public_key = context.accounts.user.key();
        msg!("Greetings from {}", context.program_id);
        msg!("User {}'s favorite number is {} and favorite color is: {}",
            user_public_key,
            number,
            color
        );
        context
            .accounts
            .favorites
            .set_inner(Favorites { number, color });

        Ok(())
    }

    pub fn update_favorites(ctx: Context<UpdateFavorites>, number: Option<u64>, color: Option<String>,) -> Result<()> {
        let favorites = &mut ctx.accounts.favorites;
    
        if let Some(new_number) = number {
            favorites.number = new_number;
        }
    
        if let Some(new_color) = color {
            favorites.color = new_color;
        }
    
        Ok(())
    }
}
