import { format, formatDistanceToNow, isValid } from "date-fns";

//import icone stuff
import { Dot, CalendarIcon, Timer } from "lucide-react";

interface MeetingCardProps {
  meeting: {
    _id: string;
    title: string;
    _creationTime: number; // Using _creationTime as the timestamp
    duration: number; // Duration in seconds
  };
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting }) => {
  const { title, _creationTime, duration } = meeting;

  // Convert _creationTime to a Date object
  const date = new Date(_creationTime);

  // Check if the date is valid before formatting
  const formattedDate = isValid(date)
    ? format(date, "EEE MM/dd/yyyy '@' h:mm a")
    : "Invalid date";
  const timeAgo = isValid(date)
    ? formatDistanceToNow(date, { addSuffix: true })
    : "Invalid date";

  // Format the duration to a readable format, e.g., "27:10"
  const formattedDuration = new Date(duration * 1000)
    .toISOString()
    .substr(11, 8);

  return (
    <div className="relative rounded-xl border bg-card text-card-foreground shadow p-6">
      <div className="flex flex-col space-y-3">
        <div className="flex flex-row justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="flex flex-row items-center space-x-2">
          <CalendarIcon size={16} />
          <p className="text-sm">{formattedDate}</p>
        </div>
        <div className="flex flex-row space-x-2 items-center">
          <Timer size={16} />
          <p className="text-sm">{formattedDuration}</p>
        </div>
        <p className="absolute bottom-2 right-2 text-sm text-muted-foreground">
          {timeAgo}
        </p>
      </div>
      {/* Add more details here as needed */}
    </div>
  );
};

export default MeetingCard;
