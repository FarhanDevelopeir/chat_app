// Add this function to handle scrolling to message
export const scrollToMessage = (messageId) => {
  const messageElement = document.getElementById(`message-${messageId}`);
  if (messageElement) {
    messageElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
    
    // Add highlight effect
    messageElement.classList.add('bg-blue-50');
    setTimeout(() => {
      messageElement.classList.remove('bg-blue-50');
    }, 1000);
  }
};