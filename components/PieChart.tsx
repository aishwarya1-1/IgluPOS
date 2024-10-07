import React, { useState } from 'react';
import { auth } from '@/auth';
import { getTopIcecreams } from '@/app/lib/actions';
import { PieChartClient } from './PieChartClient';

// Main wrapper component to fetch data and render the PieChart
export default async function PieWrapper() {
  const session = await auth(); 
  const userId = session?.user?.id;


  // Fetch data
  const iceCreamData = await getTopIcecreams(userId);

  return (
    <div className="w-full h-64">
      <PieChartClient data={iceCreamData} />
    </div>
  );
}