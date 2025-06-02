'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="mb-8">
          <p className="text-gray-600 text-sm">Yönlendiriliyor...</p>
        </div>

        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-gray-600 text-sm">Lütfen bekleyin</span>
        </div>
      </div>
    </div>
  );
}
