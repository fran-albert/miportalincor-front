import React from "react";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  breadcrumbItems: Array<{
    label: string;
    href?: string;
    icon?: React.ReactNode;
  }>;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: string | number;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumbItems,
  title,
  description,
  icon,
  actions,
  badge,
}) => {
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <BreadcrumbComponent items={breadcrumbItems} />

      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          {icon && (
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-greenPrimary to-teal-600 text-white shadow-md flex-shrink-0">
              {icon}
            </div>
          )}

          {/* Title and Description */}
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {title}
              </h1>
              {badge !== undefined && (
                <Badge
                  variant="secondary"
                  className="bg-greenPrimary/10 text-greenPrimary hover:bg-greenPrimary/20 font-semibold"
                >
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm sm:text-base text-gray-600">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
