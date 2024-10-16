import React from 'react';
import CardWrapper from '@/components/cards';
import PieWrapper from '@/components/PieChart';
import { DatePickerWithRange } from '@/components/graph';

const Page = () => {
  return (
    <main className="px-4"> {/* Add padding for better spacing */}
      <div className="grid gap-12 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mt-20">
        <CardWrapper />
        <PieWrapper />
      </div>
      <hr className="solid mt-20 mb-4" />
      <div className="mt-8 gap-5">
        <DatePickerWithRange />
      </div>
    </main>
  );
};

export default Page;
