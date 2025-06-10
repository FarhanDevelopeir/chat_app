// 5. EmptyState.jsx - Empty state when no user/group selected
'use client';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#f0f2f5]">
      <div className="flex justify-center">
        <img
          src="/whatsapp.png"
          alt="WhatsApp Logo"
          className="h-40 w-40"
        />
      </div>
      <p className="text-gray-500 mt-10 text-2xl">Select a user or group to start chatting</p>
    </div>
  );
}