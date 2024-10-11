
import { getTodaySales } from '@/app/lib/actions';
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
    
    let totalSalesSum;
    try {
     
        totalSalesSum=await getTodaySales(userId)

      }
     catch (error) {
      const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return <ErrorComponent message={errorMessage} />;
    }
    return (
      <>
      
  
        <Card title="Today Sales" value={totalSalesSum} type="collected" />
       
      </>
    );
  }
  
  export function Card({
    title,
    value,
    type,
  }: {
    title: string;
    value: number | string;
    type:  'collected';
  }) {
    const Icon = iconMap[type];
  
    return (
      <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
        <div className="flex p-4">
          {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
          <h3 className="ml-2 text-sm font-medium">{title}</h3>
        </div>
        <p
          className={`
            truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
        >
          {value}
        </p>
      </div>
    );
  }
  