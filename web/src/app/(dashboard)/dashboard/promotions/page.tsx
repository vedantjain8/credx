// app/dashboard/promotions/page.tsx
"use client";

import { useAuth } from "@/app/context/auth";
import React, { useState, useEffect } from "react";

// Define the shape of our data with TypeScript types
type Website = {
  website_id: string;
  domain_name: string;
  status: string;
};

type Article = {
  id: string;
  title: string;
  promotions: {
    status: 'active' | 'completed' | 'inactive';
    budget: string;
    credits_spent: string;
  }[];
};

type ArticlesByWebsite = {
  [key: string]: Article[];
};

export default function PromotionsPage() {
  const { user, session, loading: isAuthLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Article | null>(null);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);

  const [websites, setWebsites] = useState<Website[]>([]);
  const [articles, setArticles] = useState<ArticlesByWebsite>({});
  
  const [loadingWebsites, setLoadingWebsites] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticlesForWebsite = async (websiteId: string) => {
    try {
      setLoadingArticles(true);
      
      const response = await fetch(`/api/dashboard/articles?websiteId=${websiteId}`, {
      
      });
      if (!response.ok) throw new Error('Failed to fetch articles.');
      const data = await response.json();
      setArticles(prev => ({ ...prev, [websiteId]: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching articles');
    } finally {
      setLoadingArticles(false);
    }
  };

  // This function now only handles the UI logic of toggling the accordion
  const handleWebsiteSelect = (websiteId: string) => {
    const newSelectedId = selectedWebsiteId === websiteId ? null : websiteId;
    setSelectedWebsiteId(newSelectedId);

    // Fetch articles only if a new website is selected and we don't have its data yet
    if (newSelectedId && !articles[newSelectedId]) {
      fetchArticlesForWebsite(newSelectedId);
    }
  };

  const handlePromotionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedContent || !selectedWebsiteId) return;

    const formData = new FormData(event.currentTarget);
    const budget = formData.get("budget");

    try {
      const response = await fetch('/api/dashboard/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: selectedContent.id,
          budget: Number(budget),
          status: 'active'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create promotion.');
      }
      
      await fetchArticlesForWebsite(selectedWebsiteId);

    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      handleCloseModal();
    }
  };


  // Effect to fetch the list of websites on page load
  useEffect(() => {
    const fetchWebsites = async () => {
      if (!session) {
        setLoadingWebsites(false);
        return;
      }
      try {
        setLoadingWebsites(true);
        const response = await fetch('/api/websites');
        if (!response.ok) throw new Error('Failed to fetch websites.');
        const data = await response.json();
        setWebsites(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoadingWebsites(false);
      }
    };
    fetchWebsites();
  }, [session]);

  const handlePromoteClick = (content: Article) => {
    console.log("Article selected for promotion:", content);
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };

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
        <p>Please log in to view promotions.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-black p-8 text-white">
      <div>
        <h1 className="text-3xl font-bold text-white">My Promotions</h1>
        <p className="mt-2 text-gray-400">
          Select a website to view its articles and manage promotions.
        </p>

        <div className="mt-8 space-y-4">
          {loadingWebsites && <p className="text-gray-400">Loading websites...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loadingWebsites && !error && websites.length === 0 && (
             <p className="text-red-500">NO WEBSITES</p>
          )}

          {!loadingWebsites && !error && websites.map((website) => (
            <div key={website.website_id} className="overflow-hidden rounded-lg bg-black border border-gray-800/50">
              <button
                onClick={() => handleWebsiteSelect(website.website_id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-white">{website.domain_name}</span>
                <span className={`transform text-gray-400 transition-transform duration-200 ${selectedWebsiteId === website.website_id ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {selectedWebsiteId === website.website_id && (
                <div className="border-t border-gray-800">
                  {loadingArticles && <p className="p-4 text-gray-400">Loading articles...</p>}
                  {!loadingArticles && (
                    <table className="min-w-full divide-y divide-gray-800">
                      <thead className="bg-gray-950">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-400">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-400">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-400">Budget / Spent</th>
                          <th className="relative px-6 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800 bg-black">
                        {articles[website.website_id]?.map((item) => {
                          const promotion = item.promotions?.[0];
                          const status = promotion ? promotion.status : 'not_promoted';
                          const budget = promotion ? promotion.budget : "0";
                          const spent = promotion ? promotion.credits_spent : "0";

                          return (
                            <tr key={item.id}>
                              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">{item.title}</td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm">
                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                    status === 'active' ? 'bg-blue-900/50 text-blue-300' :
                                    status === 'completed' ? 'bg-gray-800 text-gray-300' :
                                    'bg-yellow-900/50 text-yellow-300'
                                  }`}
                                >
                                  {status.replace('_', ' ').toUpperCase()}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                                ${parseFloat(budget).toFixed(2)} / ${parseFloat(spent).toFixed(2)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                {status === 'not_promoted' && (
                                  <button onClick={() => handlePromoteClick(item)} className="text-blue-400 hover:text-blue-300">
                                    Promote
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
          <div className="w-full max-w-md rounded-lg bg-gray-950 p-6 shadow-xl border border-gray-800">
            <h2 className="text-xl font-bold text-white">Create Promotion</h2>
            <p className="mt-2 text-sm text-gray-400">You are promoting: <span className="font-semibold text-white">{selectedContent?.title}</span></p>
            <form onSubmit={handlePromotionSubmit} className="mt-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-300">Budget (in Credits)</label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="budget"
                    id="budget"
                    className="block w-full rounded-md border-gray-700 bg-gray-900 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g., 100"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={handleCloseModal} className="rounded-md border border-gray-700 bg-transparent px-4 py-2 text-sm font-medium text-gray-300 shadow-sm hover:bg-gray-800">
                  Cancel
                </button>
                <button type="submit" className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                  Start Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

