import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

interface BreadcrumbComponentProps {
  items: Array<{
    label: string;
    href?: string;
    icon?: React.ReactNode;
  }>;
}

const BreadcrumbComponent: React.FC<BreadcrumbComponentProps> = ({ items }) => {
  return (
    <Breadcrumb className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100">
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLastItem = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.href && !isLastItem ? (
                  <BreadcrumbLink asChild>
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-greenPrimary transition-colors"
                    >
                      {isFirst && <Home className="h-4 w-4" />}
                      {item.icon && !isFirst && item.icon}
                      <span className="capitalize">{item.label}</span>
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="flex items-center gap-2 text-sm font-semibold text-greenPrimary">
                    {item.icon && item.icon}
                    <span className="capitalize">{item.label}</span>
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator className="text-gray-400" />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbComponent;
