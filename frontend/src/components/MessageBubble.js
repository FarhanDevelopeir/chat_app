export default function MessageBubble({ message, isOwnMessage }) {
    const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div
          className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-indigo-500 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-indigo-100' : 'text-gray-500'}`}>
            {formattedTime}
            {message.isRead && isOwnMessage && (
              <span className="ml-1">✓</span>
            )}
          </p>
        </div>
      </div>
    );
  }