import { AiOutlineWarning } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";

const WarningToast = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-auto relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <IoMdClose size={20} />
      </button>
      <div className="flex flex-col items-center">
        <div className="bg-yellow-100 rounded-full p-4 mb-4">
          <AiOutlineWarning className="text-yellow-600" size={48} />
        </div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default WarningToast;
