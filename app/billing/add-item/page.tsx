import CreateIceCreamForm from "@/components/CreateIceCreamForm";

const Page = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white min-h-[70vh] ">
    <div className="max-w-lg w-full p-4"> {/* Adjust max-w as needed */}
      <CreateIceCreamForm />
    </div>
  </div>
  );
};

export default Page;