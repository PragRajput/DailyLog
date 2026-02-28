'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import type { User } from './types';

export function useUser() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.me()
      .then((data) => {
        if (!data) router.push('/login');
        else setUser(data);
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, loading };
}
