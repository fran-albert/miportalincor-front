import ActionIcon from "@/components/Icons/action";
import { Button } from "@/components/ui/button";
import { FaRegEye } from "react-icons/fa";
import { Link } from "react-router-dom";

export const ViewButton = ({
  slug,
  text,
  path,
  url,
}: {
  slug?: string;
  text: string;
  path?: string;
  url?: string;
}) => {
  const handleClick = () => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="flex justify-center">
      {url ? (
        <Button variant="ghost" size="icon" onClick={handleClick}>
          <ActionIcon
            tooltip={text}
            icon={<FaRegEye className="w-4 h-4" color="gray" />}
          />
        </Button>
      ) : (
        <Link to={`/${path}/${slug}`}>
          <Button variant="ghost" size="icon">
            <ActionIcon
              tooltip={text}
              icon={<FaRegEye className="w-4 h-4" color="gray" />}
            />
          </Button>
        </Link>
      )}
    </div>
  );
};
