import { CogIcon } from "./icons/CogIcon";
import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import { useDeepgram, voiceMap } from "../context/Deepgram";

// const ModelSelection = () => {
//   return (
//     <Select
//       items={users}
//       label="Assigned to"
//       className="max-w-xs"
//       variant="bordered"
//       classNames={{
//         label: "group-data-[filled=true]:-translate-y-5",
//         trigger: "min-h-unit-16",
//         listboxWrapper: "max-h-[400px]",
//       }}
//       listboxProps={{
//         itemClasses: {
//           base: [
//             "rounded-md",
//             "text-default-500",
//             "transition-opacity",
//             "data-[hover=true]:text-foreground",
//             "data-[hover=true]:bg-default-100",
//             "dark:data-[hover=true]:bg-default-50",
//             "data-[selectable=true]:focus:bg-default-50",
//             "data-[pressed=true]:opacity-70",
//             "data-[focus-visible=true]:ring-default-500",
//           ],
//         },
//       }}
//       popoverProps={{
//         classNames: {
//           base: "before:bg-default-200",
//           content: "p-0 border-small border-divider bg-background",
//         },
//       }}
//       renderValue={(items) => {
//         return items.map((item) => (
//           <div key={item.key} className="flex items-center gap-2">
//             <Avatar
//               alt={item.data.name}
//               className="flex-shrink-0"
//               size="sm"
//               src={item.data.avatar}
//             />
//             <div className="flex flex-col">
//               <span>{item.data.name}</span>
//               <span className="text-default-500 text-tiny">
//                 ({item.data.email})
//               </span>
//             </div>
//           </div>
//         ));
//       }}
//     >
//       {(user) => (
//         <SelectItem key={user.id} textValue={user.name}>
//           <div className="flex gap-2 items-center">
//             <Avatar
//               alt={user.name}
//               className="flex-shrink-0"
//               size="sm"
//               src={user.avatar}
//             />
//             <div className="flex flex-col">
//               <span className="text-small">{user.name}</span>
//               <span className="text-tiny text-default-400">{user.email}</span>
//             </div>
//           </div>
//         </SelectItem>
//       )}
//     </Select>
//   );
// }

export const Settings = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { ttsOptions } = useDeepgram();

  return (
    <>
      <div className="flex items-center gap-2.5 text-sm">
        <span className="bg-gradient-to-r to-[#13EF93]/50 from-[#149AFB]/80 rounded-full flex">
          <a
            className={`relative m-px bg-black w-[9.25rem] md:w-10 h-10 rounded-full text-sm p-2.5 group hover:w-[9.25rem] transition-all ease-in-out duration-1000 overflow-hidden whitespace-nowrap`}
            href="#"
            onClick={onOpen}
          >
            <CogIcon className="w-5 h-5 transition-transform ease-in-out duration-2000 group-hover:rotate-180" />
            <span className="ml-2.5 text-xs">Change settings</span>
          </a>
        </span>
        <span className="hidden md:inline-block text-white/50 font-inter">
          Voice:{" "}
          <span className="text-white">{voiceMap(ttsOptions.model).name}</span>
        </span>
      </div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        className="glass"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Settings
              </ModalHeader>
              <ModalBody>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

// <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>;
