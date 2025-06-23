import { AiOutlineLoading3Quarters } from "react-icons/ai";

const LoadingToast = ({ message }: { message: string }) => (
  <div className="bg-white shadow-md rounded-lg p-4 max-w-xs flex items-center space-x-3">
    <AiOutlineLoading3Quarters
      className="text-greenPrimary animate-spin"
      size={28}
    />
    <p className="text-gray-700 font-medium text-sm">{message}</p>
  </div>
);

export default LoadingToast;
