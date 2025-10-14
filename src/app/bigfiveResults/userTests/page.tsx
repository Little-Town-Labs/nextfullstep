'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UserTestsPage() {
  const [userTestIds, setUserTestIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/bigfiveResults/userTests')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch user test IDs');
        }
        return res.json();
      })
      .then((data) => {
        setUserTestIds(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!userTestIds.length) return <p>No user tests found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Tests</h1>
      <ul>
        {userTestIds.map((id) => (
          <li key={id}>
            <Link href={`/bigfiveResults?testId=${id}`} className="text-blue-600 hover:underline">
              {id}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}