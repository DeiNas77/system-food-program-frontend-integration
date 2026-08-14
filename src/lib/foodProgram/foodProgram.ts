//InitializeConfig
import { getCreateSystemFoodInstructionAsync } from "@/src/generated/food_inventory";

//AddProgram
import { getAddFoodInstruction } from "@/src/generated/food_inventory";
//Find Inventory
import { findInventoryFoodPda } from "@/src/generated/food_inventory/pdas";

export {
  getCreateSystemFoodInstructionAsync,
  getAddFoodInstruction,
  findInventoryFoodPda,
};
