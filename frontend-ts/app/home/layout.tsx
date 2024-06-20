import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "../components/SidebarNavItems";

const sidebarNavItems = [
    {
        title: "Playground",
        href: "/home",
    },
    {
        title: "Insights",
        href: "/home/track",
    },
    {
        title: "Parent controls",
        href: "/home/parent",
    },
];

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="md:max-w-screen-xl mx-auto">
            <div className="block space-y-6 p-6 md:p-12 pb-16">
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                    <aside className="-mx-4 lg:w-1/5">
                        <SidebarNav items={sidebarNavItems} />
                    </aside>
                    <div className="flex-1 ">{children}</div>
                    {/* <div className="flex-1 lg:max-w-2xl">{children}</div> */}
                </div>
            </div>
        </div>
    );
}
