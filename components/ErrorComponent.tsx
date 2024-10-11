function ErrorComponent({ message }: { message: string }) {
    return (
      <div className="text-red-500 font-bold">
        {message}
      </div>
    );
  }
  
  export default ErrorComponent;