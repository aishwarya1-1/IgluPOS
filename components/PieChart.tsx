import React from 'react';
import { auth } from '@/auth';
import { getTopIcecreams } from '@/app/lib/actions';
import { PieChartClient } from './PieChartClient';
import ErrorComponent from './ErrorComponent';

// Main wrapper component to fetch data and render the PieChart
export default async function PieWrapper() {
  const session = await auth(); 
  const userId = session?.user?.storeId;




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
    <div className="w-full h-54 sm:h-48 md:h-64 lg:h-64 flex items-center "> 
     <h5 className="text-lg font-semibold mb-4 text-blue-600">Top 7 Selling Ice Creams</h5>{/* Center the chart */}
    <div className="w-full h-full max-w-[300px]"> {/* Set max width for small screens */}
      <PieChartClient data={iceCreamData} />
    </div>
  </div>
  );
}