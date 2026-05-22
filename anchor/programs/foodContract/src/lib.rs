use anchor_lang::prelude::*;

declare_id!("HE6uvfjUH5GCn9WXz8TNZ1NpZqJXFPU3hQbUf7FtkuzJ");

#[program]
pub mod food_inventory {
    use super::*;

    pub fn create_system_food(ctx: Context<CreateSystemFood>, name: String) -> Result<()> {
        require!(name.len() <= 50, FoodErrors::CreateTitleSystemToLoong);

        let owner_id = ctx.accounts.owner.key();
        let foods: Vec<Food> = Vec::new();

        msg!("Owner id: {}", owner_id);

        ctx.accounts.inventory_food.set_inner(InventoryFood {
            owner: owner_id,
            name,
            foods,
        });
        Ok(())
    }
    pub fn add_food(ctx: Context<InventoryAccess>, name: String, quantity: u64) -> Result<()> {
        require!(name.len() <= 90, FoodErrors::TitleTooLoongForFood);

        require!(quantity > 0, FoodErrors::InvalidQuantity);

        let inventory_food = &mut ctx.accounts.inventory_food;

        let normalized_name = name.to_lowercase();

        let food_position = inventory_food
            .foods
            .iter()
            .position(|f| f.name == normalized_name);

        if let Some(index) = food_position {
            inventory_food.foods[index].quantity += quantity;

            msg!(
                "Food already exists. New quantity: {}",
                inventory_food.foods[index].quantity
            )
        } else {
            require!(inventory_food.foods.len() < 10, FoodErrors::SpacesForFood);

            let foods = Food {
                name: normalized_name,
                quantity,
            };

            inventory_food.foods.push(foods);

            msg!("Food added to inventory");
        }

        Ok(())
    }
    pub fn show_foods(ctx: Context<InventoryAccess>) -> Result<()> {
        let foods = &ctx.accounts.inventory_food.foods;

        if foods.is_empty() {
            msg!("Inventory is empty");
            return Ok(());
        }

        for food in foods {
            msg!("Food: {} | Quantity: {}", food.name, food.quantity);
        }

        Ok(())
    }

    pub fn show_foods_by_id(ctx: Context<InventoryAccess>, name: String) -> Result<()> {
        let inventory_food = &ctx.accounts.inventory_food;

        let normalized_name = name.to_lowercase();

        let food = inventory_food
            .foods
            .iter()
            .find(|f| f.name == normalized_name);

        if let Some(food) = food {
            msg!("Food found:");
            msg!("Name: {}", food.name);
            msg!("Quantity: {}", food.quantity);
        } else {
            msg!("Food not found");
        }

        Ok(())
    }
    pub fn delete_quantity_food(
        ctx: Context<InventoryAccess>,
        name: String,
        quantity: u64,
    ) -> Result<()> {
        let inventory_food = &mut ctx.accounts.inventory_food;

        let normalized_name = name.to_lowercase();

        let food_position = inventory_food
            .foods
            .iter()
            .position(|f| f.name == normalized_name);

        if let Some(index) = food_position {
            require!(
                inventory_food.foods[index].quantity >= quantity,
                FoodErrors::InvalidQuantity
            );

            inventory_food.foods[index].quantity -= quantity;

            msg!(
                "Quantity removed. New quantity: {}",
                inventory_food.foods[index].quantity
            );

            if inventory_food.foods[index].quantity == 0 {
                inventory_food.foods.remove(index);
                msg!("Food removed from inventory because quantity reached 0");
            }
        } else {
            msg!("Food not found");
        }

        Ok(())
    }

    pub fn delete_food(ctx: Context<InventoryAccess>, name: String) -> Result<()> {
        let inventory_food = &mut ctx.accounts.inventory_food;

        let normalized_name = name.to_lowercase();

        let food_position = inventory_food
            .foods
            .iter()
            .position(|f| f.name == normalized_name);

        if let Some(index) = food_position {
            let deleted_food = inventory_food.foods.remove(index);

            msg!(
                "Food deleted: {} | Quantity was: {}",
                deleted_food.name,
                deleted_food.quantity
            );
        } else {
            msg!("Food not Found");
        }
        Ok(())
    }

    pub fn update_food(
        ctx: Context<InventoryAccess>,
        name: String,
        new_quantity: u64,
        new_name: Option<String>,
    ) -> Result<()> {
        require!(new_quantity > 0, FoodErrors::InvalidQuantity);

        let inventory_food = &mut ctx.accounts.inventory_food;

        let normalized_name = name.to_lowercase();

        let food_position = inventory_food
            .foods
            .iter()
            .position(|f| f.name == normalized_name);

        if let Some(index) = food_position {
            if let Some(ref new_name) = new_name {
                let normalized_new_name = new_name.to_lowercase();

                require!(
                    !inventory_food
                        .foods
                        .iter()
                        .any(|f| f.name == normalized_new_name && f.name != normalized_name),
                    FoodErrors::FoodAlreadyExists
                );

                require!(
                    normalized_new_name.len() <= 90,
                    FoodErrors::TitleTooLoongForFood
                );

                inventory_food.foods[index].name = normalized_new_name;
            }

            inventory_food.foods[index].quantity = new_quantity;

            msg!(
                "Food updated: {} | Quantity: {}",
                inventory_food.foods[index].name,
                inventory_food.foods[index].quantity
            );
        } else {
            msg!("Food not found");
        }

        Ok(())
    }
}

#[error_code]
pub enum FoodErrors {
    #[msg(
        "The name of database should be less or equal a 50 caracters for create a database food"
    )]
    CreateTitleSystemToLoong,
    #[msg("There's only have 10 spaces for put foods")]
    SpacesForFood,
    #[msg("The title should be less or equal a 90 characters for the name a food")]
    TitleTooLoongForFood,
    #[msg("Quantity must be greater than 0")]
    InvalidQuantity,
    #[msg("Food already exists in inventory")]
    FoodAlreadyExists,
}

#[account]
#[derive(InitSpace)]
pub struct InventoryFood {
    owner: Pubkey,
    #[max_len(50)]
    name: String,

    #[max_len(10)]
    foods: Vec<Food>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace, PartialEq, Debug)]
pub struct Food {
    #[max_len(90)]
    pub name: String,

    pub quantity: u64,
}

#[derive(Accounts)]
pub struct CreateSystemFood<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = InventoryFood::INIT_SPACE + 8,
        seeds = [b"food", owner.key().as_ref()],
        bump
    )]
    pub inventory_food: Account<'info, InventoryFood>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InventoryAccess<'info> {
    pub owner: Signer<'info>,

    #[account(mut)]
    pub inventory_food: Account<'info, InventoryFood>,
}