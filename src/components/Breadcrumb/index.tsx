import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import { Link } from "react-router-dom";

interface BreadcrumbComponentProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

const BreadcrumbComponent: React.FC<BreadcrumbComponentProps> = ({ items }) => {
  return (
    <Breadcrumb className="p-2">
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLastItem = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem
                className={` font-medium text-greenPrimary hover:text-teal-800 ${
                  isLastItem
                    ? "font-bold text-greenPrimary hover:text-teal-800"
                    : ""
                }`}
              >
                {item.href && !isLastItem ? (
                  <Link to={item.href}>
                    <>{item.label}</>
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbComponent;
