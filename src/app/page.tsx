"use client";

import { GridBackground } from "../components/grid-background";
import { ThemeToggle } from "../components/theme-toggle";
import { ClusterSelect } from "../components/cluster-select";
import { WalletButton } from "../components/wallet-button";

import { Field } from "../components/Field";
import { ButtonAction } from "../components/ButtonAction";
import { useEffect, useState } from "react";
import { useAddFood } from "../lib/hooks/useAddFood";
import { useInitializeInventory } from "../lib/hooks/useInitializeSystem";
import {
  fetchInventoryFood,
  findInventoryFoodPda,
} from "../generated/food_inventory";
import { useSolanaClient } from "../lib/solana-client-context";
import { useWallet } from "../lib/wallet/context";
import { useDeleteFoodByQuantity } from "../lib/hooks/useDeleteFoodByQuantity";
import { useDeleteFood } from "../lib/hooks/useDeleteFood";
import { useUpdateFood } from "../lib/hooks/useUpdateFood";

export default function Home() {
  const client = useSolanaClient();
  const { signer } = useWallet();
  //AddFood
  const { addFood, loading } = useAddFood();
  const [food, setFood] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  //Inventory
  const [foods, setFoods] = useState<
    {
      name: string;
      quantity: bigint;
    }[]
  >([]);
  //DeleteFoodByQuantity
  const { deleteFoodByQuantity, loading: deleting } = useDeleteFoodByQuantity();
  const [deleteFoods, setDeleteFoods] = useState<{
    nameFood: string;
    quantity: string;
  }>({
    nameFood: "",
    quantity: "",
  });
  //DeleteFoodPermanent
  const [deleteFoodName, setDeleteFoodName] = useState<string>("");
  const { deleteFood, loading: deletingPermanent } = useDeleteFood();

  const [updateFoods, setUpdateFood] = useState({
    name: "",
    newName: "",
    quantity: "",
  });

  const { updateFood, loading: LoadingUpdate } = useUpdateFood();

  useEffect(() => {
    if (!signer) return;

    const loadInventory = async () => {
      const [inventoryFoodPda] = await findInventoryFoodPda({
        owner: signer.address,
      });
      const inventory = await fetchInventoryFood(client.rpc, inventoryFoodPda);
      if (inventory?.data?.foods) {
        setFoods(inventory.data.foods);
      }
    };

    loadInventory().catch(console.error);
  }, [signer]); // se ejecuta cuando la wallet se conecta

  const { initializeInventory, loading: initializing } =
    useInitializeInventory();

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <GridBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight">
            Solana Starter Kit
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ClusterSelect />
            <WalletButton />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6">
          {/* Hero */}
          <section className="pt-6 pb-15 md:pt-8 md:pb-28">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="font-black tracking-tight text-foreground">
                  <span className="block text-6xl md:text-7xl">
                    System Food Invetory
                  </span>
                  <span className="block text-4xl md:text-2xl pt-5">
                    This evaluation is about integration of page
                  </span>
                </h1>
              </div>
            </div>
            <div></div>
          </section>

          {/* Template content */}
          <div className="grid gap-6 lg:grid-cols-[1fr_380px] pb-10">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl ">
              <div className="mb-8 pl-1">
                <h2 className="text-md text-4xl font-bold tracking-tigh">
                  Dashboard System Food
                </h2>
                <p className="text-sm mt-2 text-zinc-400">
                  Manage your own system food in the blockchain
                </p>
              </div>
              <div className="space-y-10">
                <section className="space-y-5">
                  <div className="pl-1">
                    <h3 className="text-lg font-semibold">
                      Create Inventory Database
                    </h3>

                    <p className="text-sm text-zinc-500">
                      Initialize your food inventory PDA account.
                    </p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field
                      description="Create Database"
                      type="text"
                      placeholder="Inventory Food"
                      disabled
                    />
                    <Field description="Admin Wallet" type="text" disabled />
                  </div>
                  <ButtonAction
                    color="cyan"
                    description={
                      initializing ? "Initializing..." : "Create Inventory"
                    }
                    onClick={async () => {
                      await initializeInventory();
                    }}
                  />
                </section>
                {/* Add Food */}
                <section className="space-y-5">
                  <div className="pl-1">
                    <h3 className="text-lg font-semibold">Add Food</h3>
                    <p className="text-sm text-zinc-500">
                      Insert a name of the aliment or increase their quantity
                    </p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field
                      description="Food"
                      type="text"
                      placeholder="apple"
                      value={food}
                      onChange={(e) => setFood(e.target.value)}
                    />

                    <Field
                      description="quantity"
                      type="number"
                      placeholder="5"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    <ButtonAction
                      description={loading ? "Loading..." : "Add Food"}
                      color="fuchsia"
                      onClick={async () => {
                        const result = await addFood(food, Number(quantity));

                        setFoods(result.inventory.data.foods);
                      }}
                    />
                  </div>
                </section>
                {/* Update Food */}
                <section className="space-y-5">
                  <div className="pl-1">
                    <h3 className="text-lg font-semibold">Update Food</h3>
                    <p className="text-sm text-zinc-500">
                      Update quantity or rename an existing food.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Field
                      description="Current Name"
                      type="text"
                      placeholder="Rice"
                      value={updateFoods.name}
                      onChange={(e) =>
                        setUpdateFood({ ...updateFoods, name: e.target.value })
                      }
                    />
                    <Field
                      description="New Name"
                      type="text"
                      placeholder="Eggs"
                      value={updateFoods.newName}
                      onChange={(e) =>
                        setUpdateFood({
                          ...updateFoods,
                          newName: e.target.value,
                        })
                      }
                    />
                    <Field
                      description="New Quantity"
                      type="number"
                      placeholder="50"
                      value={updateFoods.quantity}
                      onChange={(e) =>
                        setUpdateFood({
                          ...updateFoods,
                          quantity: e.target.value,
                        })
                      }
                    />
                  </div>
                  <ButtonAction
                    description={LoadingUpdate ? "Updating..." : "Update Food"}
                    color="orange"
                    onClick={async () => {
                      const result = await updateFood(
                        updateFoods.name,
                        Number(updateFoods.quantity),
                        updateFoods.newName
                      );
                      setFoods(result.inventory.data.foods);
                      setUpdateFood({ name: "", newName: "", quantity: "" });
                    }}
                  />
                </section>
                {/* Delete Food by Quantity */}
                <section className="space-y-5">
                  <div className="pl-1">
                    <h3 className="text-lg font-semibold">
                      Delete Food by Quantity
                    </h3>

                    <p className="text-sm text-zinc-500">
                      Delete a food item by quantity
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      description="Current Name of Food"
                      type="text"
                      placeholder="Meat"
                      value={deleteFoods.nameFood}
                      onChange={(e) =>
                        setDeleteFoods({
                          ...deleteFoods,
                          nameFood: e.target.value,
                        })
                      }
                    />

                    <Field
                      description="Quantity to remove"
                      type="number"
                      placeholder="12"
                      value={deleteFoods.quantity}
                      onChange={(e) =>
                        setDeleteFoods({
                          ...deleteFoods,
                          quantity: e.target.value,
                        })
                      }
                    />
                  </div>

                  <ButtonAction
                    description={
                      deleting ? "Deleting..." : "Delete Food by Quantity"
                    }
                    color="emerald"
                    onClick={async () => {
                      const result = await deleteFoodByQuantity(
                        deleteFoods.nameFood,
                        Number(deleteFoods.quantity)
                      );

                      setFoods(result.inventory.data.foods);
                    }}
                  />
                </section>
                {/* Remove Food */}
                <section className="space-y-5">
                  <div className="pl-1">
                    <h3 className="text-lg font-semibold">Delete Food</h3>
                    <p className="text-sm text-zinc-500">
                      Permanently remove a food item.
                    </p>
                  </div>
                  <Field
                    description="Food to Delete"
                    type="text"
                    placeholder="Rice"
                    value={deleteFoodName}
                    onChange={(e) => setDeleteFoodName(e.target.value)}
                  />
                  <ButtonAction
                    description={
                      deletingPermanent ? "Deleting..." : "Delete Food"
                    }
                    color="red"
                    onClick={async () => {
                      const result = await deleteFood(deleteFoodName);
                      setFoods(result.inventory.data.foods);
                      setDeleteFoodName("");
                    }}
                  />
                </section>
              </div>
            </div>
            <div
              className="
      h-fit rounded-3xl border border-white/10
      bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Inventory Preview</h3>

                  <p className="text-sm text-zinc-500">
                    Blockchain stored foods
                  </p>
                </div>

                <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold  text-emerald-400 ">
                  Devnet
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-4">
                  {foods.map((food) => (
                    <div
                      key={food.name}
                      className="
        flex items-center justify-between rounded-2xl
        border border-white/10 bg-black/20
        px-4 py-4 transition-all
        hover:border-yellow-500/20
        hover:bg-yellow-500/10"
                    >
                      <div>
                        <h4 className="font-semibold">{food.name}</h4>

                        <p className="text-sm text-zinc-500">
                          Food item stored on-chain
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold">
                        {food.quantity.toString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
