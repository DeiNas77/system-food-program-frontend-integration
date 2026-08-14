import { useState } from "react";
import { useSolanaClient } from "../solana-client-context";
import { useWallet } from "../wallet/context";
import { findInventoryFoodPda } from "../foodProgram/foodProgram";
import {
  fetchInventoryFood,
  getDeleteQuantityFoodInstruction,
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

export const useDeleteFoodByQuantity = () => {
  const client = useSolanaClient();
  const { signer } = useWallet();
  const [loading, setLoading] = useState(false);

  const deleteFoodByQuantity = async (name: string, quantity: number) => {
    if (!signer) throw new Error("That wallet is not connected");

    //PDA
    const [foodIventoryPda] = await findInventoryFoodPda({
      owner: signer?.address,
    });

    try {
      setLoading(true);

      //Instruction
      const instruction = getDeleteQuantityFoodInstruction({
        owner: signer,
        inventoryFood: foodIventoryPda,
        name: name.trim().toLocaleLowerCase(),
        quantity: BigInt(quantity),
      });

      console.log(instruction, "instruction");

      //Blocklash

      const { value: latestBlockhash } = await client.rpc
        .getLatestBlockhash()
        .send();

      //Transaction Message

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

      const inventory = await fetchInventoryFood(client.rpc, foodIventoryPda);

      return { signature, inventory };
    } finally {
      setLoading(false);
    }
  };
  return {
    deleteFoodByQuantity,
    loading,
  };
};
