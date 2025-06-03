import { SocketProvider } from '@/context/SocketContext';
import ConnectionStatus from '@/components/ConnectionStatus';
import './globals.css';

export const metadata = {
  title: 'WinChat',
  description: 'Real-time chat application with admin panel',
  // icons: {
  //   icon: '/favicon.ico',
  // },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>
          {children}
          {/* <ConnectionStatus /> */}
        </SocketProvider>
      </body>
    </html>
  );
}