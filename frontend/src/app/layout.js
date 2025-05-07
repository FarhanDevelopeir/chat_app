import { SocketProvider } from '@/context/SocketContext';
import ConnectionStatus from '@/components/ConnectionStatus';
import './globals.css';

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
          <ConnectionStatus />
        </SocketProvider>
      </body>
    </html>
  );
}