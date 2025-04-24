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

// V2
#[account]
#[derive(InitSpace)]
pub struct FavoritesV2 {
    pub number: Option<u64>,
    #[max_len(50)]
    pub color: Option<String>,
    pub authority: Option<Pubkey>,
    pub creator: Pubkey,   
}

#[derive(Accounts)]
pub struct SetFavoritesV2<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + FavoritesV2::INIT_SPACE,
        seeds = [b"favorites_v2", user.key().as_ref()],
        bump,
    )]
    pub favorites_v2: Account<'info, FavoritesV2>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetFavoritesV2Authority<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"favorites_v2", user.key().as_ref()],
        bump,
    )]
    pub favorites_v2: Account<'info, FavoritesV2>,
}

#[derive(Accounts)]
pub struct UpdateFavoritesV2<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"favorites_v2", user.key().as_ref()],
        bump,
        constraint = favorites_v2.creator == user.key() || 
                     favorites_v2.authority == Some(user.key())
    )]
    pub favorites_v2: Account<'info, FavoritesV2>,
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

    // V2
    pub fn set_favorites_v2(
        context: Context<SetFavoritesV2>,
        number: Option<u64>,
        color: Option<String>,
        authority: Option<Pubkey>,    
    ) -> Result<()> {
        let user_public_key = context.accounts.user.key();
        msg!("Greetings from {}", context.program_id);
        msg!("User {}'s favorite number is {:?} and favorite color is: {:?} and authority: {:?}",
            user_public_key,
            number,
            color,
            authority
        );

        context
            .accounts
            .favorites_v2
            .set_inner(FavoritesV2 { number, color, authority, creator: user_public_key });

        Ok(())
    }

    pub fn set_favorites_v2_authority(
        context: Context<SetFavoritesV2Authority>,
        new_authority: Option<Pubkey>,
    ) -> Result<()> {
        let favorites = &mut context.accounts.favorites_v2;
    
        require_keys_eq!(context.accounts.user.key(), favorites.creator);
    
        favorites.authority = new_authority;

        Ok(())
    }

    pub fn update_favorites_v2(
        context: Context<UpdateFavoritesV2>,
        number: Option<u64>,
        color: Option<String>,
        authority: Option<Pubkey>,
    ) -> Result<()> {
        let favorites = &mut context.accounts.favorites_v2;
    
        favorites.number = number;
        favorites.color = color;
        favorites.authority = authority;
    
        Ok(())
    }
    
}
