'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reproio?: (...args: any[]) => void;
  }
}

interface SessionResponse {
  authenticated: boolean;
  user?: { userId: string; email: string; username: string };
}

export default function Home() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data: SessionResponse) => {
        setSession(data);
        setLoading(false);

        // ログイン済みの場合、Repro Web SDK にユーザーIDを設定
        if (data.authenticated && data.user) {
          if (typeof window.reproio === 'function') {
            window.reproio('setUserID', data.user.userId);
          }
        }
      })
      .catch(() => {
        setSession({ authenticated: false });
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession({ authenticated: false });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (session?.authenticated && session.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
        <main className="w-full max-w-2xl py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">ようこそ、{session.user.username}さん</h1>
              <p className="text-gray-600">ログイン中</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">アカウント情報</h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">ユーザーID</dt>
                  <dd className="text-sm font-mono text-gray-900 truncate ml-4">{session.user.userId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">メールアドレス</dt>
                  <dd className="text-sm text-gray-900">{session.user.email}</dd>
                </div>
              </dl>
            </div>

            <button
              onClick={handleLogout}
              className="block w-full text-center bg-white hover:bg-gray-50 text-gray-600 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <main className="w-full max-w-2xl py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">LINE クリック連携デモ</h1>
            <p className="text-gray-600">
              Repro Web SDK を使った LINE 簡単ID連携のデモアプリです。<br />
              アカウントを作成またはログインして、Repro Web SDK の動作を確認できます。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/register"
              className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              アカウント作成
            </a>
            <a
              href="/login"
              className="flex-1 text-center bg-white hover:bg-gray-50 text-green-600 font-semibold py-4 px-6 rounded-lg border-2 border-green-600 transition-colors"
            >
              ログイン
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
