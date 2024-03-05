import { CogIcon } from "./icons/CogIcon";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useDeepgram, voiceMap } from "../context/Deepgram";

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
          <span className="text-white">{voiceMap(ttsOptions.model)}</span>
        </span>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Modal Title
              </ModalHeader>
              <ModalBody>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
                <p>
                  Magna exercitation reprehenderit magna aute tempor cupidatat
                  consequat elit dolor adipisicing. Mollit dolor eiusmod sunt ex
                  incididunt cillum quis. Velit duis sit officia eiusmod Lorem
                  aliqua enim laboris do dolor eiusmod. Et mollit incididunt
                  nisi consectetur esse laborum eiusmod pariatur proident Lorem
                  eiusmod et. Culpa deserunt nostrud ad veniam.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
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
