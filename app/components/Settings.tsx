import { useState } from "react";
import { CogIcon } from "./icons/CogIcon";

export const Settings = () => {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="bg-gradient-to-r to-[#13EF93]/50 from-[#149AFB]/80 rounded-full flex">
        <a
          onClick={() => setClicked(true)}
          className={`relative m-px bg-black w-[9.25rem] md:w-10 h-10 rounded-full text-sm p-2.5 group hover:w-[9.25rem] transition-all ease-in-out duration-1000 overflow-hidden whitespace-nowrap`}
          href="#"
        >
          <CogIcon className="w-5 h-5 transition-transform ease-in-out duration-2000 group-hover:rotate-180" />
          <span className="ml-2.5 text-xs">Change settings</span>
        </a>
      </span>
      <span className="hidden md:inline-block text-white/50 font-inter">
        Voice: <span className="text-white">Stella</span>
      </span>
    </div>
  );
};

// <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>;
