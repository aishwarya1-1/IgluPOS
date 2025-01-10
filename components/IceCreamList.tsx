'use client'

import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { Button, Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { getIceCreamData, deleteIceCreamById } from '@/app/lib/actions'
import { useRouter } from 'next/navigation'
import { Category } from '@prisma/client'
import { CreateIcecream } from '@/app/validation_schemas'

export default function IceCreamList() {
  const router = useRouter();
  const [iceCreamFlavors, setIceCreamFlavors] = useState<CreateIcecream[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getIceCreamData();
        if (result.success) {
          setIceCreamFlavors(result.data);
        } else {
          setError('Failed to fetch ice cream data');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading ice cream flavors...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const filteredFlavors = iceCreamFlavors.filter((flavor) => {
    const matchesSearch = flavor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || flavor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm('Are you sure you want to delete this ice cream?');
    
    if (confirmDelete) {
      try {
        await deleteIceCreamById(id);
        setIceCreamFlavors(prevFlavors => prevFlavors.filter(flavor => flavor.id !== id));
        router.refresh();
      } catch (error) {
        console.error("Error deleting ice cream:", error);
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Ice Cream Flavors</h2>
      
      <div className="flex gap-4 mb-4">
        <select
          className="p-2 border rounded w-48"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {Object.values(Category).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search flavors..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="h-[500px] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredFlavors.map((flavor) => (
            <div key={flavor.id} className="bg-gray-100 p-4 rounded-lg relative">
              <Menu as="div" className="absolute top-2 right-2">
                <Menu.Button className="p-1 rounded-full hover:bg-gray-200">
                  <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                </Menu.Button>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link href={{
                            pathname: `/billing/${flavor.id}/edit`,
                            query: {
                              name: flavor.name,
                              category: flavor.category,
                              price: flavor.cost,
                              action: "icecream",
                            },
                          }}>
                            <button
                              className={`${
                                active ? 'bg-blue-500 text-white' : 'text-gray-900'
                              } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                            >
                              Edit
                            </button>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-red-500 text-white' : 'text-gray-900'
                            } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                            onClick={() => handleDelete(flavor.id)}
                          >
                            Delete
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              <div className="mb-2">
                <h3 className="text-lg font-semibold">{flavor.name}</h3>
                <p className="text-xs italic text-gray-500">({flavor.category})</p>
              </div>
              <p className="text-gray-600 mb-4">{flavor.cost.toFixed(2)}</p>
              <button
                onClick={() => addToCart(flavor)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}