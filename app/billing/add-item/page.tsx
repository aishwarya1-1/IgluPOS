'use client';
import CreateIceCreamForm from "@/components/CreateIceCreamForm";
import CreateAddonForm from "@/components/CreateAddonForm";
import { useState } from "react";

const Page = () => {
  const [activeTab, setActiveTab] = useState('icecream');

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-lg md:max-w-md sm:max-w-sm p-4 sm:p-6 md:p-8">
        {/* Tab Headers */}
        <div className="flex mb-4 border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'icecream' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('icecream')}
          >
            Add Ice Cream
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'addon' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('addon')}
          >
            Add Addon
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'icecream' ? (
          <CreateIceCreamForm />
        ) : (
          <CreateAddonForm />
        )}
      </div>
    </div>
  );
};

export default Page;
