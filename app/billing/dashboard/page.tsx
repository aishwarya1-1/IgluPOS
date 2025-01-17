import React from 'react';
import CardWrapper from '@/components/cards';
import PieWrapper from '@/components/PieChart';
import { DatePickerWithRange } from '@/components/graph';

const Page = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Main container with responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top section with CardWrapper and PieWrapper */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card section */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center">
            <div className="w-full">
              <CardWrapper />
            </div>
          </div>

          {/* Pie chart section */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center">
            <div className="w-full">
              <PieWrapper />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8" />

        {/* Date picker and graph section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col space-y-6">
            <DatePickerWithRange />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;