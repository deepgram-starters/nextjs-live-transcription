"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string;
        title: string;
    }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
    const pathname = usePathname();

    return (
        <nav
            className={cn(
                "flex space-x-2 justify-center lg:flex-col lg:space-x-0 lg:space-y-6 rounded-xl",
                className
            )}
            {...props}
        >
            {items.map((item) => {
                // console.log(pathname, item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            pathname === item.href ? "bg-pink-50" : "",
                            // pathname === item.href
                            //     ? "bg-muted hover:bg-muted"
                            //     : "hover:bg-transparent hover:underline",
                            "justify-start rounded-2xl text-xl font-baloo2 text-pink-700"
                        )}
                    >
                        {item.title}
                        {pathname === item.href && (
                            <span className="ml-2 text-5xl">·</span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
