import { CogIcon } from "./icons/CogIcon";

export const Settings = () => {
  return (
    <a
      className="glass w-[9.5rem] md:w-10 h-10 border rounded-full text-sm p-2.5 group hover:w-[9.5rem] transition-all ease-in-out duration-1000 overflow-hidden whitespace-nowrap"
      href="#"
    >
      <CogIcon className="w-5 h-5 transition-transform ease-in-out duration-2000 group-hover:rotate-180" />
      <span className="ml-2.5 text-xs">Change settings</span>
    </a>
  );
};
