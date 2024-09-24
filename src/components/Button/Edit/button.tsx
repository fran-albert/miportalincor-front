import ActionIcon from "@/components/Icons/action";
import { Button } from "@/components/ui/button";
import { FaPencilAlt } from "react-icons/fa";

import { Link } from "react-router-dom";

interface EditButtonIconProps {
  id?: number;
  text?: string;
  path?: string;
  props?: any;
  slug?: string;
  onClick?: () => void;
  className?: string;
}

export const EditButtonIcon: React.FC<EditButtonIconProps> = ({
  slug,
  props,
  path,
  onClick,
  className = "",
}) => {
  const handleEdit = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <button
        {...props}
        onClick={handleEdit}
        className="p-1 border border-transparent rounded transition-colors duration-200"
      >
        {onClick ? (
          <Button variant={"ghost"} size="icon">
            <ActionIcon
              tooltip="Editar"
              icon={<FaPencilAlt className="text-gray-600 w-4 h-4" />}
            />
          </Button>
        ) : (
          <Link to={`/${path}/${slug}/editar`}>
            <div className="flex items-center">Editar Datos</div>
          </Link>
        )}
      </button>
    </div>
  );
};
