// app/dashboard/wallet/page.tsx
"use client";

import { useAuth } from "@/app/context/auth";
import React, { useState, useEffect } from "react";

// This is the main page component for the /dashboard/wallet route.
export default function WalletPage() {
  const { user, session, loading: isAuthLoading } = useAuth();

  // State to hold the wallet data fetched from the API
  type WalletTransaction = {
    transaction_id: string;
    created_at: string;
    transaction_type: string;
    amount: string | number;
  };

  const [walletData, setWalletData] = useState<{
    balance: number;
    transactions: WalletTransaction[];
  }>({
    balance: 0,
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // The API route uses server-side cookies, so the Authorization header is not needed.
        const response = await fetch("/api/dashboard/wallet", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch wallet data.");
        }

        const data = await response.json();
        // Convert balance to number right after fetching
        setWalletData({
          ...data,
          balance: parseFloat(data.balance),
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [session]); // This effect runs whenever the session changes.

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <p>Please log in to view your wallet.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-black p-8 text-white">
      <div>
        <h1 className="text-3xl font-bold text-white">My Wallet</h1>
        <p className="mt-2 text-gray-400">Track your earnings and spending.</p>

        {/* Balance Display Card */}
        <div className="mt-8 w-full max-w-md rounded-lg bg-black p-6 shadow-lg border border-gray-700">
          <h2 className="text-sm font-medium text-gray-400">Current Balance</h2>
          {loading ? (
            <p className="mt-1 text-4xl font-semibold text-gray-500">...</p>
          ) : error ? (
            <p className="mt-1 text-lg font-semibold text-red-500">{error}</p>
          ) : (
            <p className="mt-1 text-4xl font-semibold text-white">
              <span className="text-green-400">
                {walletData.balance.toFixed(2)}
              </span>{" "}
              Credits
            </p>
          )}
        </div>

        {/* Transaction History Table */}
        <div className="mt-8 flex flex-col">
          <h2 className="text-xl font-semibold text-white">
            Transaction History
          </h2>
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-lg shadow-md border border-gray-700">
                {loading ? (
                  <div className="p-4 text-center text-gray-400">
                    Loading transactions...
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">{error}</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-950">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400"
                        >
                          Type
                        </th>

                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400"
                        >
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 bg-black">
                      {walletData.transactions &&
                        walletData.transactions.map((transaction) => (
                          <tr key={transaction.transaction_id}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                              {new Date(
                                transaction.created_at
                              ).toLocaleDateString()}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                                  parseFloat(transaction.amount.toString()) > 0
                                    ? "bg-green-900/50 text-green-300"
                                    : "bg-red-900/50 text-red-300"
                                }`}
                              >
                                {transaction.transaction_type
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </span>
                            </td>
                            <td
                              className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${
                                parseFloat(String(transaction.amount)) > 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {parseFloat(transaction.amount.toString()) > 0
                                ? `+${parseFloat(
                                    String(transaction.amount)
                                  ).toFixed(2)}`
                                : parseFloat(
                                    String(transaction.amount)
                                  ).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
