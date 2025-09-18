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
    where: {
      OR: [
        { from_wallet_id: wallet.wallet_id },
        { to_wallet_id: wallet.wallet_id },
      ],
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 20,
  });

  const responseData = {
    balance: wallet.balance,
    transactions: transactions,
  };

  return responseData;
}
