
import { Loader2 } from "lucide-react";

export default function ChatLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700 border-opacity-60 animate-spin"></div>
          
          {/* Inner accent border */}
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-t-teal-500 border-l-transparent border-r-transparent border-b-transparent animate-spin"></div>
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-teal-500 rounded-full opacity-70"></div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 font-medium text-sm animate-pulse">
          Loading chat...
        </p>
      </div>
    </div>
  );
}