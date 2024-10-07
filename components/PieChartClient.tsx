'use client';

import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the required components for the chart
ChartJS.register(ArcElement, Tooltip, Legend);

// Define the type for each ice cream data item
interface IceCreamData {
  name: string | undefined;
  quantity: number | null;
}

// Define props for the PieChart component
interface PieChartProps {
  data: IceCreamData[];
}

// PieChart component to render the chart
export function PieChartClient({ data }: PieChartProps) {
  // Prepare labels and quantities for the chart
  const labels = data.map(item => item.name || 'Unknown');
  const quantities = data.map(item => item.quantity || 0); // Handle null values

  const chartData = {
    labels,
    datasets: [
      {
        label: '# of Sales',
        data: quantities,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Pie 
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: true,
      }} 
    />
  );
}