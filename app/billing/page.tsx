import IceCreamList from '../../components/IceCreamList'
import Checkout from '../../components/Checkout'
interface HomeProps {
  searchParams: {
    billKey?: string; 
  };
}
export default async function Home({ searchParams }: HomeProps) {
  const { billKey } = searchParams || {};
  
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Adjusting the margin and text alignment for the title on mobile */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-8 text-center text-blue-600 mt-7 md:mt-0">
        Iglu Cream Shop Billing
      </h1>

      {/* Adjusting the grid layout for mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <IceCreamList />
        <div>
        <Checkout billKey={billKey} />
        </div>
      </div>
    </main>
  )
}
