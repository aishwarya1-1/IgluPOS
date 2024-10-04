import IceCreamList from '../../components/IceCreamList'

import Checkout from '../../components/Checkout'



export default async function Home() {


  return (
   
    <main className="container mx-auto px-4 py-8 ">
     
            
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">Iglu Cream Shop Billing</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <IceCreamList />
        <div>
 
          <Checkout />
        </div>
      </div>
    </main>

  )
}