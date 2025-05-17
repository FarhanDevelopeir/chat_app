// import { SocketProvider } from '@/context/SocketContext';
// import ConnectionStatus from '@/components/ConnectionStatus';
// import './globals.css';
// import { Toaster } from "@/components/ui/sonner"


// export const metadata = {
//   title: 'Chat Application',
//   description: 'Real-time chat application with admin panel',
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body>
//         <SocketProvider>
//           <>
//           <>{children}</>
//           <Toaster />
//           </>
//           {/* <div className="fixed bottom-0 right-0 p-4">
//             <ConnectionStatus />
//           {/* <ConnectionStatus /> */}
//         </SocketProvider>
//       </body>
//     </html>
//   );
// }

// src/app/layout.js

import { SocketProvider } from '@/context/SocketContext';
import ConnectionStatus from '@/components/ConnectionStatus';
import './globals.css';
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: 'Chat Application',
  description: 'Real-time chat application with admin panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>
          {children}
          {/* <Toaster /> */}
          {/* <div className="fixed bottom-0 right-0 p-4">
            <ConnectionStatus />
          </div> */}
        </SocketProvider>
      </body>
    </html>
  );
}
