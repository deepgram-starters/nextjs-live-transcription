import Link from "next/link";
import React from "react";

//import ui stuff
import { ChevronRight, Folder } from "lucide-react";

type BreadcrumbItemProps = {
  children: React.ReactNode;
  href?: string; // Optional href property
};

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  children,
  href,
}) => {
  // If href is provided, wrap the children with a Link and an anchor tag
  const content = href ? (
    <Link href={href}>
      <div className="">{children}</div>
    </Link>
  ) : (
    // If no href is provided, just render the children
    <span className="">{children}</span>
  );

  return <li className="inline">{content}</li>;
};

type BreadcrumbsProps = {
  children: React.ReactNode;
  className?: string; // Optional className property
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  children,
  className,
}) => (
  <nav aria-label="breadcrumb" className={className}>
    <ol className="list-none p-0 inline-flex text-sm items-center">
      {React.Children.map(children, (child, index) => (
        <>
          {index === 0 && (
            <li className="mx-2 text-muted-foreground-50">
              <Folder size={16} />
            </li>
          )}
          {index > 0 && (
            <li className="mx-2 text-muted-foreground-50">
              <ChevronRight size={16} />
            </li>
          )}
          {child}
        </>
      ))}
    </ol>
  </nav>
);
