import { AiOutlineCheckCircle } from "react-icons/ai";

const SuccessToast = ({ message }: { message: string }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg relative p-8 g w-full h-full flex flex-col items-center justify-center">
      <div className="rounded-full p-4 mb-4flex items-center justify-center">
        <AiOutlineCheckCircle className="text-greenPrimary" size={60} />
      </div>
      <p className="text-gray-700 font-medium text-center text-lg mt-2">
        {message}
      </p>
    </div>
  );
};

export default SuccessToast;
