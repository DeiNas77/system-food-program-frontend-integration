"use client";

import { GridBackground } from "../components/grid-background";
import { ThemeToggle } from "../components/theme-toggle";
import { ClusterSelect } from "../components/cluster-select";
import { WalletButton } from "../components/wallet-button";

const buttonStyle = ``;

import { Field } from "../components/Field";
import { ButtonAction } from "../components/ButtonAction";

export default function Home() {
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
          <div className="grid border-2 border-purple-900 gap-6 lg:grid-cols-[1fr_380px]">
            <div className="border-2 border-amber-300 p-5">
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
                    <Field description="Create Database" type="text" />
                    <Field description="Admin Wallet" type="text" disabled />
                  </div>
                  <ButtonAction color="cyan" description="Create Inventory" />
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
                    <Field description="Food" type="text" placeholder="apple" />
                    <Field
                      description="quantity"
                      type="number"
                      placeholder="5"
                    />
                    <ButtonAction description="Add Food" color="fuchsia" />
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
                    />

                    <Field
                      description="New Name"
                      type="text"
                      placeholder="Eggs"
                    />

                    <Field
                      description="New Quantity"
                      type="number"
                      placeholder="50"
                    />
                  </div>
                  <ButtonAction description="Update Food" color="orange" />
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
                    />

                    <Field
                      description="Quantity to remove"
                      type="number"
                      placeholder="12"
                    />
                  </div>

                  <ButtonAction
                    description="Delete Food by Quantity"
                    color="emerald"
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
                  />

                  <ButtonAction description="Delete Food" color="red" />
                </section>
              </div>
            </div>
            <div className="border-2 border-orange-300 ">a</div>
          </div>
        </main>
      </div>
    </div>
  );
}
