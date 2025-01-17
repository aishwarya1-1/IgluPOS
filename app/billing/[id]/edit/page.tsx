'use client'

import EditIceCreamForm from "@/components/editIceCream"
import EditAddonForm from "@/components/editAddon"
import { useSearchParams } from 'next/navigation'
import { notFound } from 'next/navigation'

const Page = ({ params }: { params: { id: string } }) => {
  const searchParams = useSearchParams()
  const id = parseInt(params.id, 10)
  
  // Get all query parameters
  const name = searchParams.get('name')
  const category = searchParams.get('category')
  const price = searchParams.get('price')
  const action = searchParams.get('action')

  // If essential data is missing, show 404
  if (!name || !category || !price) {
    notFound()
  }

  // Create initial data object from query params
  const initialData = {
    id,
    name,
    category,
    price: parseFloat(price), // Convert price string to number
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white min-h-[70vh]">
      <div className="max-w-lg w-full p-4">
        {action === 'icecream' ? (
          <EditIceCreamForm initialData={initialData} />
        ) : action === 'addon' ? (
          <EditAddonForm initialData={initialData} />
        ) : (
          <div>Invalid action type</div>
        )}
      </div>
    </div>
  )
}

export default Page