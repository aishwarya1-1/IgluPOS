import { getRecentOrders } from '@/app/lib/actions';
import { auth } from '@/auth';
import LastOrdersList from '@/components/LastOrdersList';

import { Suspense } from 'react';

export default async function LastOrdersPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const recentOrders = await getRecentOrders(userId);

  return (
    <main className="p-6 mt-16">
      <h1 className="text-2xl font-bold mb-6">Last 20 Orders</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <LastOrdersList orders={recentOrders} />
      </Suspense>
    </main>
  );
} 