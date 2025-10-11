//RETURNS WALLET DATA 

import { NextResponse } from 'next/server';
import GetWalletData from '@/controller/ViewWallet';
import AuthenticateUser from '@/controller/AuthenticateUser';


export async function GET(request: Request) {
  try {
    const user = await AuthenticateUser();
    const walletData = await GetWalletData(user.id);
    return NextResponse.json(walletData, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    const statusCode = errorMessage.includes("Wallet not found") ? 404 : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
