
import React from 'react'

import CardWrapper from '@/components/cards';
import PieWrapper from '@/components/PieChart';
import { DatePickerWithRange } from '@/components/graph';

const Page = () => {
 
  return (
    <main>
   
    <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-2 pl-6 mt-5 ">
      <CardWrapper />
      <PieWrapper /> 
    </div>
    <hr className="solid mt-8"></hr>
    <div className="mt-8 gap-5">
<DatePickerWithRange />
    </div>
  </main>

  );
}

export default Page;


