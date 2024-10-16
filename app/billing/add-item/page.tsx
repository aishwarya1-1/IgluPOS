import CreateIceCreamForm from "@/components/CreateIceCreamForm";

const Page = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-lg md:max-w-md sm:max-w-sm p-4 sm:p-6 md:p-8"> {/* Adjusts the width and padding for different screen sizes */}
        <CreateIceCreamForm />
      </div>
    </div>
  );
};

export default Page;
