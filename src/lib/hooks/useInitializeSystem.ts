"use client";

import { useState } from "react";

import {
  appendTransactionMessageInstruction,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  sendAndConfirmTransactionFactory,
  signTransactionMessageWithSigners,
} from "@solana/kit";

import { useSolanaClient } from "../solana-client-context";

import {
  getCreateSystemFoodInstructionAsync,
  findInventoryFoodPda,
} from "@/src/lib/foodProgram/foodProgram";

import { useWallet } from "../wallet/context";

export const useInitializeInventory = () => {
  const client = useSolanaClient();

  const { signer } = useWallet();

  const [loading, setLoading] = useState(false);

  const initializeInventory = async () => {
    if (!signer) {
      throw new Error("Wallet not connected");
    }

    try {
      setLoading(true);

      const [inventoryFoodPda] = await findInventoryFoodPda({
        owner: signer.address,
      });

      console.log("OWNER:", signer.address);
      console.log("PDA:", inventoryFoodPda);

      const accountInfo = await client.rpc
        .getAccountInfo(inventoryFoodPda, {
          encoding: "base64",
        })
        .send();

      console.log("ACCOUNT INFO:", accountInfo);

      if (accountInfo.value) {
        console.warn("Inventory already initialized");

        return {
          alreadyInitialized: true,
          pda: inventoryFoodPda,
        };
      }

      const instruction = await getCreateSystemFoodInstructionAsync({
        owner: signer,
        name: "Main Inventory",
      });

      console.log("INSTRUCTION:", instruction);

      const latestBlockhash = await client.rpc.getLatestBlockhash().send();

      const transactionMessage = pipe(
        createTransactionMessage({
          version: 0,
        }),
        (tx) => setTransactionMessageFeePayerSigner(signer, tx),
        (tx) =>
          setTransactionMessageLifetimeUsingBlockhash(
            latestBlockhash.value,
            tx
          ),
        (tx) => appendTransactionMessageInstruction(instruction, tx)
      );

      console.log("TX MESSAGE:", transactionMessage);

      const signedTransaction =
        await signTransactionMessageWithSigners(transactionMessage);

      console.log("SIGNED TX:", signedTransaction);

      const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
        rpc: client.rpc,
        rpcSubscriptions: client.rpcSubscriptions,
      });

      const signature = await sendAndConfirmTransaction(
        signedTransaction as never,
        {
          commitment: "confirmed",
        }
      );

      console.log("SIGNATURE:", signature);

      return {
        signature,
        pda: inventoryFoodPda,
      };
    } catch (error) {
      console.error("FULL ERROR:", error);

      console.log(
        JSON.stringify(
          error,
          (_, value) => (typeof value === "bigint" ? value.toString() : value),
          2
        )
      );

      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    initializeInventory,
    loading,
  };
};
