import { AiOutlineCloseCircle } from "react-icons/ai";

const ErrorToast = ({ message }: { message: string }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg relative p-8 g w-full h-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="rounded-full p-4 mb-4flex items-center justify-center">
          <AiOutlineCloseCircle className="text-red-600" size={60} />
        </div>
        <p className="text-gray-700 font-medium text-center text-lg mt-2">
          {message}
        </p>
      </div>
    </div>
  );
};

export default ErrorToast;
