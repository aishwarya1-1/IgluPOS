'use client';
import { CartItem } from '@/context/CartContext';
import React, { useEffect, useState } from 'react';
import { TrashIcon } from '@heroicons/react/16/solid';
import { useRouter } from 'next/navigation';

type BillData = {
  cart: CartItem[];
  totalCost: number;
  date: string;
};

const ITEMS_PER_PAGE = 10;

const Page = () => {
  const router = useRouter();
  const [bills, setBills] = useState<{ key: string; data: BillData }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const billEntries: { key: string; data: BillData }[] = [];

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('table_')) {
        const billData = localStorage.getItem(key);
        if (billData) {
          const parsedData = JSON.parse(billData);
          billEntries.push({ key, data: parsedData });
        }
      }
    });

    setBills(billEntries);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.clear();
    console.log('cleared');
  };

  const handleDelete = (key: string) => {
    localStorage.removeItem(key);
    setBills((prevBills) => prevBills.filter((bill) => bill.key !== key));
  };

  const handleBillClick = (billKey: string) => {
    router.push(`/billing?billKey=${billKey}`);
  };

  const totalPages = Math.ceil(bills.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBills = bills.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <input
          type="text"
          className="border border-gray-300 rounded-md p-2 w-full sm:w-64"
          placeholder="Search For Bill..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className={`p-2 rounded-md w-full sm:w-auto ${searchQuery ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          disabled={!searchQuery}
        >
          Open Bill
        </button>
      </form>

      {bills.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 mt-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b">Bill Name</th>
                  <th className="py-2 px-4 border-b hidden sm:table-cell">Cart (Items)</th>
                  <th className="py-2 px-4 border-b">Total Cost</th>
                  <th className="py-2 px-4 border-b hidden sm:table-cell">Date</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBills.map((bill) => (
                  <tr
                    key={bill.key}
                    className="cursor-pointer hover:bg-blue-100 transition duration-150 ease-in-out"
                    onClick={() => handleBillClick(bill.key)}
                  >
                    <td className="py-2 px-4 border-b">{bill.key.replace('table_', '')}</td>
                    <td className="py-2 px-4 border-b hidden sm:table-cell">
                      {bill.data.cart.map((item) => `${item.name}(${item.quantity})`).join(', ')}
                    </td>
                    <td className="py-2 px-4 border-b">Rs. {bill.data.totalCost.toFixed(2)}</td>
                    <td className="py-2 px-4 border-b hidden sm:table-cell">{bill.data.date}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(bill.key);
                        }}
                      >
                        <TrashIcon className="w-6 h-6" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="flex justify-center items-center space-x-2 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50 text-sm"
            >
              Prev
            </button>
            <span className="text-sm">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50 text-sm"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-red-500 mt-4">No bills found in localStorage</p>
      )}
    </div>
  );
};

export default Page;