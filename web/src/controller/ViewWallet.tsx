import prisma from "@/lib/prisma";

export default async function GetWalletData(user_id: string) {
  const wallet = await prisma.wallets.findFirst({
    where: {
      user_id: user_id,
    },
    select: {
      wallet_id: true,
      balance: true,
    },
  });

  if (!wallet) {
    throw new Error("Wallet not found for this user.");
  }

  const transactions = await prisma.transactions.findMany({
    select: {
      transaction_id: true,
      created_at: true,
      transaction_type: true,
      amount: true,
      from_wallet_id: true,
      to_wallet_id: true,
    },
    where: {
      OR: [
        { from_wallet_id: wallet.wallet_id },
        { to_wallet_id: wallet.wallet_id },
      ],
    },
    orderBy: {
      created_at: "desc",
    },
    take: 20,
  });

  const responseData = {
    balance: String(wallet.balance),
    transactions: transactions.map((t) => {
      const fromId = t.from_wallet_id ?? null;
      const toId = t.to_wallet_id ?? null;
      const amtStr = String(t.amount);

      // If this wallet is the sender, show negative amount. Otherwise show positive.
      const signedAmount = fromId === wallet.wallet_id && toId !== wallet.wallet_id ? `-${amtStr}` : amtStr;

      return {
        transaction_id: String(t.transaction_id),
        created_at: t.created_at ? t.created_at.toISOString() : null,
        transaction_type: t.transaction_type,
        amount: signedAmount,
      };
    }),
  };

  return responseData;
}
