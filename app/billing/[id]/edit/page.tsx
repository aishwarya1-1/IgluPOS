
import EditIceCreamForm from "@/components/editIceCream";
import { getIceCreamById } from "@/app/lib/actions";
import { notFound } from 'next/navigation';


const  Page = async ({params} :{params :{id:string}}) => {

  const id = parseInt(params.id, 10);
  
  const  initialData=await getIceCreamById(id)
  const iceCreamData = initialData.data;

  if(!initialData.success){
    notFound()
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-white min-h-[70vh] ">
    <div className="max-w-lg w-full p-4"> 
    <EditIceCreamForm 
  initialData={iceCreamData} 
/>
    </div>
  </div>
  );
};

export default Page;


