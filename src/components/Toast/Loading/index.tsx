import { AiOutlineLoading3Quarters } from "react-icons/ai";

const LoadingToast = ({ message }: { message: string }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg relative p-8 g w-full h-full flex flex-col items-center justify-center">
      <div className="rounded-full p-4 mb-4 animate-spin">
        <AiOutlineLoading3Quarters className="text-greenPrimary" size={64} />
      </div>
      <p className="text-gray-700 font-medium text-center text-lg">{message}</p>
    </div>
  );
};

export default LoadingToast;
