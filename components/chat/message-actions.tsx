import { Clipboard, CheckCircle, RotateCcw, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MessageActionsProps {
  messageId: string;
  messageText: string;
  onCopy: (messageText: string, callback: () => void) => void; // Now expects a callback as the second argument
  onRedo: (messageId: string) => void;
  onThumbsDown: (messageId: string) => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  messageText,
  onCopy,
  onRedo,
  onThumbsDown,
}) => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    onCopy(messageText, () => {
      // This now matches the updated interface
      setHasCopied(true);
      setTimeout(() => {
        setHasCopied(false);
      }, 5000); // Revert back to clipboard icon after 5 seconds
    });
  };

  return (
    <div className="absolute bottom-0.5 right-0.5 space-x-0">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        aria-label="Copy"
        title="Copy"
      >
        {hasCopied ? <CheckCircle size={16} /> : <Clipboard size={16} />}
      </Button>
      {/* <Button
        variant="ghost"
        size="sm"
        onClick={() => onRedo(messageId)}
        aria-label="Redo"
        title="Redo"
      >
        <RotateCcw size={16} />
      </Button> */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onThumbsDown(messageId)}
        aria-label="Thumbs Down"
        title="Thumbs Down"
      >
        <ThumbsDown size={16} />
      </Button>
    </div>
  );
};

export default MessageActions;
