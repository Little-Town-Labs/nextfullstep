'use client';

import React, { useEffect, useState } from 'react';

interface BigFiveResult {
  id: string;
  category: string;
  score: number;
  comment: string;
  userTestId: string;
  resultType: 'category' | 'subcategory';
}

interface Props {
  searchParams: {
    testId?: string;
  };
}

export default function BigFiveResultsPage({ searchParams }: Props) {
  const [categories, setCategories] = useState<BigFiveResult[]>([]);
  const [subcategories, setSubcategories] = useState<BigFiveResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testId = searchParams.testId;

  useEffect(() => {
    if (!testId) {
      setError('No testId provided in query parameters.');
      return;
    }
    setLoading(true);
    fetch(`/api/bigfiveResults?testId=${testId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch results');
        }
        return res.json();
      })
      .then((data) => {
        setCategories(data.categories || []);
        setSubcategories(data.subcategories || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [testId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!categories.length && !subcategories.length) return <p>No results found for testId: {testId}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Big Five Results for Test ID: {testId}</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Category Results</h2>
        {categories.length ? (
          <table className="min-w-[300px] border mb-4">
            <thead>
              <tr>
                <th className="border px-2 py-1">Trait</th>
                <th className="border px-2 py-1">Score</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(result => (
                <tr key={result.id}>
                  <td className="border px-2 py-1">{result.category}</td>
                  <td className="border px-2 py-1">{result.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No category results found.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Subcategory Results</h2>
        {subcategories.length ? (
          <table className="min-w-[300px] border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Facet</th>
                <th className="border px-2 py-1">Score</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map(result => (
                <tr key={result.id}>
                  <td className="border px-2 py-1">{result.category}</td>
                  <td className="border px-2 py-1">{result.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No subcategory results found.</p>
        )}
      </section>
    </div>
  );
}