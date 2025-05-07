import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Chat Application</h1>
          <p className="mt-2 text-gray-600">Choose an interface to get started</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <Link 
            href="/chatbot" 
            className="block w-full px-4 py-3 text-center text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            User Chat
          </Link>
          
          <Link 
            href="/chatbot/admin" 
            className="block w-full px-4 py-3 text-center text-white bg-gray-700 rounded-md hover:bg-gray-800"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}