import React, { useState } from 'react';
import { auth } from '@/auth';
import { getTopIcecreams } from '@/app/lib/actions';
import { PieChartClient } from './PieChartClient';
import ErrorComponent from './ErrorComponent';

// Main wrapper component to fetch data and render the PieChart
export default async function PieWrapper() {
  const session = await auth(); 
  const userId = session?.user?.id;




  let iceCreamData;
  try {
   
    iceCreamData = await getTopIcecreams(userId);

    // Check if the result is an empty array
    if (iceCreamData.length === 0) {
      return <ErrorComponent message="No data available yet" />;
    }
  } catch (error) {
    const errorMessage =
    error instanceof Error ? error.message : "An unknown error occurred";

  return <ErrorComponent message={errorMessage} />;
  }

  return (
    <div className="w-full h-64">
      <PieChartClient data={iceCreamData} />
    </div>
  );
}