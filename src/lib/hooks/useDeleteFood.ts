import { useState } from "react";
import { useSolanaClient } from "../solana-client-context";
import { useWallet } from "../wallet/context";
import { findInventoryFoodPda } from "../foodProgram/foodProgram";
import {
  fetchInventoryFood,
  getDeleteFoodInstruction,
} from "@/src/generated/food_inventory";
import {
  appendTransactionMessageInstruction,
  assertIsSendableTransaction,
  assertIsTransactionWithinSizeLimit,
  createTransactionMessage,
  getBase58Codec,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";

export const useDeleteFood = () => {
  const client = useSolanaClient();
  const { signer } = useWallet();
  const [loading, setLoading] = useState(false);

  const deleteFood = async (name: string) => {
    if (!signer) throw new Error("That wallet is not connected");

    const [foodInventoryPda] = await findInventoryFoodPda({
      owner: signer?.address,
    });

    try {
      setLoading(true);

      const instruction = getDeleteFoodInstruction({
        owner: signer,
        inventoryFood: foodInventoryPda,
        name: name.trim().toLowerCase(),
      });

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

      const inventory = await fetchInventoryFood(client.rpc, foodInventoryPda);
      return { signature, inventory };
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteFood,
    loading,
  };
};
