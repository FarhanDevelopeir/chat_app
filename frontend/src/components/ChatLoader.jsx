// import { Loader2 } from "lucide-react";
// import { Skeleton } from "@/components/ui/skeleton";

// export default function ChatLoader() {
//   return (
//     <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
//       {/* Header skeleton */}
//       <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
//         <div className="flex items-center space-x-3">
//           <Skeleton className="h-10 w-10 rounded-full" />
//           <div className="space-y-2">
//             <Skeleton className="h-4 w-28" />
//             <Skeleton className="h-3 w-16" />
//           </div>
//         </div>
//         <div className="flex space-x-2">
//           <Skeleton className="h-8 w-8 rounded-full" />
//           <Skeleton className="h-8 w-8 rounded-full" />
//         </div>
//       </div>

//       {/* Main content area */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-6">
//         {/* Message skeletons */}
//         <div className="flex items-start space-x-2 max-w-xs">
//           <Skeleton className="h-8 w-8 rounded-full" />
//           <div className="space-y-2">
//             <Skeleton className="h-16 w-48 rounded-lg" />
//             <Skeleton className="h-3 w-20" />
//           </div>
//         </div>
        
//         <div className="flex items-start justify-end space-x-2 ml-auto max-w-xs">
//           <div className="space-y-2">
//             <Skeleton className="h-12 w-48 rounded-lg ml-auto" />
//             <Skeleton className="h-3 w-20 ml-auto" />
//           </div>
//         </div>
        
//         <div className="flex items-start space-x-2 max-w-xs">
//           <Skeleton className="h-8 w-8 rounded-full" />
//           <div className="space-y-2">
//             <Skeleton className="h-20 w-56 rounded-lg" />
//             <Skeleton className="h-3 w-20" />
//           </div>
//         </div>
//       </div>

//       {/* Message input area with typing indicator */}
//       <div className="p-4 border-t dark:border-gray-800">
//         <div className="flex items-center space-x-2">
//           <div className="relative flex-1">
//             <Skeleton className="h-12 w-full rounded-full" />
//             <div className="absolute left-6 top-3 flex items-center space-x-1">
//               <span className="text-sm text-gray-500 flex items-center">
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-400" />
//                 Loading chat...
//               </span>
//             </div>
//           </div>
//           <Skeleton className="h-12 w-12 rounded-full" />
//         </div>
//       </div>
//     </div>
//   );
// }


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