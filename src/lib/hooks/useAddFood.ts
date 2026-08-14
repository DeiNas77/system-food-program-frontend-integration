"use client";
import { useState } from "react";
import {
  appendTransactionMessageInstruction,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  sendAndConfirmTransactionFactory,
  assertIsTransactionWithinSizeLimit,
  assertIsSendableTransaction,
  getBase58Codec,
} from "@solana/kit";
import { useSolanaClient } from "../solana-client-context";
import {
  getAddFoodInstruction,
  findInventoryFoodPda,
} from "@/src/lib/foodProgram/foodProgram";
import { useWallet } from "../wallet/context";
import { fetchInventoryFood } from "@/src/generated/food_inventory";

export const useAddFood = () => {
  const client = useSolanaClient();
  const { signer } = useWallet();
  const [loading, setLoading] = useState(false);

  const addFood = async (name: string, quantity: number) => {
    if (!signer) throw new Error("Wallet not connected");

    try {
      setLoading(true);

      const [inventoryFoodPda] = await findInventoryFoodPda({
        owner: signer?.address,
      });
      console.log("OWNER:", signer.address);
      console.log("PDA:", inventoryFoodPda);

      const accountInfo = await client.rpc
        .getAccountInfo(inventoryFoodPda, { encoding: "base64" })
        .send();
      console.log("ACCOUNT INFO:", accountInfo);

      if (!accountInfo.value) {
        throw new Error("Inventory not initialized. Create inventory first.");
      }

      const instruction = getAddFoodInstruction({
        owner: signer,
        inventoryFood: inventoryFoodPda,
        name: name.trim().toLowerCase(),
        quantity: BigInt(quantity),
      });
      console.log("NAME:", name);
      console.log("QUANTITY:", quantity);
      console.log("TYPE:", typeof quantity);
      console.log(instruction.accounts);

      const { value: latestBlockhash } = await client.rpc
        .getLatestBlockhash()
        .send();

      const transactionMessage = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayerSigner(signer, tx),
        (tx) =>
          setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),

        (tx) => appendTransactionMessageInstruction(instruction, tx)
      );

      const signedTransaction =
        await signTransactionMessageWithSigners(transactionMessage);

      assertIsTransactionWithinSizeLimit(signedTransaction);
      assertIsSendableTransaction(signedTransaction);

      const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
        rpc: client.rpc,
        rpcSubscriptions: client.rpcSubscriptions,
      });

      await sendAndConfirmTransaction(signedTransaction as never, {
        commitment: "confirmed",
      });

      const signaturesMap = (
        signedTransaction as { signatures: Record<string, Uint8Array> }
      ).signatures as Record<string, Uint8Array>;
      const sigBytes = Object.values(signaturesMap)[0];
      const signature = getBase58Codec().decode(sigBytes);

      console.log(signature, "Signature");
      console.log("Transaction confirmed");
      console.log("Food added successfully");

      const inventory = await fetchInventoryFood(client.rpc, inventoryFoodPda);

      return { signature, inventory };
    } finally {
      setLoading(false);
    }
  };

  return {
    addFood,
    loading,
  };
};
