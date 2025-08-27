"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/auth";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

type Website = {
  website_id: string;
  domain_name: string;
  status: string;
};

export default function DashboardWebsitesPage() {
  const { user, session, loading } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || !session) return;
    async function fetchWebsite() {
      try {
        const res = await fetch("/api/dashboard/website", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        });
        const res1 = await res.json();
        if (res.status !== 200) {
          setError(res1.message);
          setWebsites([]);
          return;
        }
        setWebsites(res1.websites);
      } catch (error) {
        console.log("Error fetching user websites: ", error);
        setWebsites([]);
      }
    }
    fetchWebsite();
  }, [user, session, loading]);

  return (
    // TODO: update the table to show dropdown for each website and an edit button to add new articles manually
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-900 rounded-xl shadow-lg">
      {error && <div className="text-red-500 mb-3 text-sm">{error}</div>}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <span className="text-white text-lg">Loading...</span>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Your Websites</h2>
        <Link href="/dashboard/websites/new">
          <Button>Add New Website</Button>
        </Link>
      </div>
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-gray-300">
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Domain</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {websites?.map((site: Website, idx: number) => (
            <tr key={site.website_id} className="bg-gray-800 rounded-lg">
              <td className="px-4 py-2 rounded-l-lg">{idx + 1}</td>
              <td className="px-4 py-2">{site.domain_name}</td>
              <td className="px-4 py-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    site.status === "active"
                      ? "bg-green-400 shadow-[0_0_8px_2px_rgba(34,197,94,0.7)]"
                      : site.status === "pending"
                      ? "bg-gray-500"
                      : site.status === "inactive"
                      ? "bg-yellow-400 shadow-[0_0_8px_2px_rgba(250,204,21,0.7)]"
                      : site.status === "blocked"
                      ? "bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.7)]"
                      : "bg-gray-500"
                  }`}
                ></span>
                {site.status === "active"
                  ? "Verified"
                  : site.status === "pending"
                  ? "Unverified"
                  : site.status === "inactive"
                  ? "Inactive"
                  : site.status === "blocked"
                  ? "Blocked"
                  : "Unknown"}
              </td>
              <td className="px-4 py-2 rounded-r-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    redirect(`/dashboard/websites/${site.website_id}`);
                  }}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
