import { getTodaySalesGroupedByPayment } from '@/app/lib/actions';
import { auth } from '@/auth';
import {
  BanknotesIcon,
} from '@heroicons/react/24/outline';

import React from 'react';
import ErrorComponent from './ErrorComponent';

const iconMap = {
  collected: BanknotesIcon,
};

export default async function CardWrapper() {
  const session = await auth(); 
  const userId = session?.user?.id;
  
  let totalGroup: { modeOfPayment: string, totalSales: number }[];
  let totalSalesSum;
  try {
    totalGroup = await getTodaySalesGroupedByPayment(userId);
    totalSalesSum = totalGroup.reduce((acc, curr) => acc + curr.totalSales, 0);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return <ErrorComponent message={errorMessage} />;
  }
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Card 
        title="Today's Sales" 
        value={totalSalesSum} 
        type="collected" 
        paymentBreakdown={totalGroup}
      />
    </div>
  );
}

export function Card({
  title,
  value,
  type,
  paymentBreakdown,
}: {
  title: string;
  value: number | string;
  type: 'collected';
  paymentBreakdown: { modeOfPayment: string; totalSales: number }[];
}) {
  const Icon = iconMap[type];

  return (
    <div className="w-full rounded-xl bg-gray-50 shadow-sm">
      <div className="flex items-center p-3 sm:p-4">
        {Icon ? <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-xs sm:text-sm font-medium">{title}</h3>
      </div>
      <div className="rounded-xl bg-white px-3 sm:px-4 py-4 sm:py-6">
        <p className="text-center text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
          ₹{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        
        <div className="space-y-2">
          {paymentBreakdown.map((payment) => (
            <div 
              key={payment.modeOfPayment}
              className="flex justify-between items-center px-3 sm:px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                {payment.modeOfPayment}
              </span>
              <span className="text-xs sm:text-sm font-semibold">
                ₹{payment.totalSales.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}