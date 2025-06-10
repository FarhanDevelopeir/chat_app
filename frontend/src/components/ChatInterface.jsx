
// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useSocket } from '@/context/SocketContext';
// import {
//   Send,
//   Edit,
//   ArrowLeft,
//   MoreVertical,
//   Users,
//   X,
// } from 'lucide-react';
// import FileMessage from './FileMessage';
// import FileUpload from './FileUpload';
// import VoiceRecorder from './VoiceRecorder';
// import AudioMessage from './AudioMessage';
// import { Button } from './ui/button';
// import {
//   Dialog,
// } from '@/components/ui/dialog';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import CreateUser from './CreateUser';
// import CreateGroupDialog from './GroupDialogue'; // Import your CreateGroup component
// import { scrollToMessage } from './utils/ChatInterface_functions';
// import MessageBubble from './MessageBubble';

// export default function ChatInterface({
//   isAdmin = false,
//   selectedUser = null,
//   selectedGroup = null,
//   admin = null,
//   users = null,
//   groups = [], 
//   dialogOpen = null,
//   setDialogOpen = null,
//   setUserToEdit = null,
//   setIsEditMode = null,
//   userToEdit = null,
//   isEditMode = null,
//   newUsername = null,
//   newPassword = null,
//   setNewUsername = null,
//   setNewPassword = null,
//   onBackClick = null,
//   chatType = 'user',
// }) {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [typing, setTyping] = useState(false);
//   const [error, setError] = useState(null);
//   const [adminOnline, setAdminOnline] = useState(false);
//   const { socket, connected } = useSocket();
//   const messagesEndRef = useRef(null);
//   const messageInputRef = useRef(null);
//   const typingTimeout = useRef(null);
//   const [createGroupOpen, setCreateGroupOpen] = useState(false); // New state for create group dialog
//   const [notificationPermission, setNotificationPermission] = useState('default');
//   const [isTabActive, setIsTabActive] = useState(true);
//   const username = isAdmin ? 'admin' : localStorage.getItem('chat_username');
//   const receiver = chatType === 'group' ? selectedGroup : (isAdmin ? selectedUser?.username : 'admin');
//   const isGroupChat = chatType === 'group';
//   const [isGroupEditMode, setIsGroupEditMode] = useState(false);
//   const [groupToEdit, setGroupToEdit] = useState(null);
//   const [isMobile, setIsMobile] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(null); // Track which message's emoji picker is open
//   const [replyingTo, setReplyingTo] = useState(null);
//   const [showDropdown, setShowDropdown] = useState(null);

//   // Add this function to handle reply
//   const handleReplyMessage = (replyToMessage) => {
//     setReplyingTo(replyToMessage);
//     messageInputRef.current?.focus();
//   };

//   const requestNotificationPermission = async () => {
//     if ('Notification' in window) {
//       try {
//         const permission = await Notification.requestPermission();
//         setNotificationPermission(permission);
//         return permission;
//       } catch (error) {
//         console.log('Notification permission error:', error);
//         return 'denied';
//       }
//     }
//     return 'denied';
//   }

//   const showNotification = (message) => {
//     console.log('message in notification', message)

//     if (notificationPermission === 'granted' || notificationPermission === 'default') {
//       const senderName = isAdmin ? message.sender : 'Admin Support';
//       let notificationBody = '';

//       if (message.audio) {
//         notificationBody = '🎵 Voice message';
//       } else if (message.file) {
//         notificationBody = message.file.type === 'image' ? '📷 Image' : '📎 File';
//       } else {
//         notificationBody = message.content;
//       }

//       const notification = new Notification(senderName, {
//         body: notificationBody,
//         icon: '/messenger.png',
//         badge: '/verify.png',
//         tag: `chat-${message.sender}`,
//         requireInteraction: false,
//         silent: false
//       });

//       setTimeout(() => {
//         notification.close();
//       }, 5000);

//       notification.onclick = () => {
//         window.focus();
//         notification.close();
//       };
//     }
//   };

//   const removeDuplicateMessages = (messages) => {
//     const uniqueMessages = [];
//     const seen = new Set();

//     for (const message of messages) {
//       const identifier = `${message.content}-${message.sender}-${message.receiver}-${message.createdAt}`;

//       if (!seen.has(identifier)) {
//         seen.add(identifier);
//         uniqueMessages.push(message);
//       }
//     }

//     return uniqueMessages;
//   };

//   useEffect(() => {
//     requestNotificationPermission();

//     const handleVisibilityChange = () => {
//       setIsTabActive(!document.hidden);
//     };

//     const handleFocus = () => setIsTabActive(true);
//     const handleBlur = () => setIsTabActive(false);

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     window.addEventListener('focus', handleFocus);
//     window.addEventListener('blur', handleBlur);

//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//       window.removeEventListener('focus', handleFocus);
//       window.removeEventListener('blur', handleBlur);
//     };
//   }, []);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   useEffect(() => {
//     if (!loading) {
//       messageInputRef.current?.focus();
//     }
//   }, [loading, isAdmin, selectedUser, selectedGroup]);

//   useEffect(() => {
//     if (!socket) return;

//     console.log('in main useEffect')

//     // Handle receiving message history
//     const handleMessagesHistory = (messageHistory) => {
//       const uniqueMessages = removeDuplicateMessages(messageHistory);
//       setMessages(uniqueMessages);
//       setLoading(false);

//       // Mark all unread messages as read
//       const unreadMessages = uniqueMessages.filter(
//         msg => !msg.isRead && (
//           (isGroupChat && msg.groupId === selectedGroup) ||
//           (!isGroupChat && msg.receiver === username)
//         )
//       );

//       if (unreadMessages.length > 0) {
//         unreadMessages.forEach(msg => {
//           if (isGroupChat) {
//             socket.emit('group:markRead', {
//               groupId: selectedGroup,
//               userId: username
//             });
//           } else {
//             socket.emit('messages:markRead', {
//               sender: msg.sender,
//               receiver: msg.receiver
//             });
//           }
//         });
//       }
//     };

//     // Handle read status updates from server
//     const handleReadStatusUpdate = (updatedMessages) => {
//       setMessages(prevMessages => {
//         return prevMessages.map(msg => {
//           // Find if this message was updated
//           const updatedMsg = updatedMessages.find(updated =>
//             updated._id === msg._id ||
//             (updated.content === msg.content &&
//               updated.sender === msg.sender &&
//               updated.receiver === msg.receiver &&
//               Math.abs(new Date(updated.createdAt) - new Date(msg.createdAt)) < 5000)
//           );

//           // If found, update the read status
//           if (updatedMsg) {
//             return { ...msg, isRead: true };
//           }

//           return msg;
//         });
//       });
//     };

//     // Handle group read status updates (Improved version - similar to user-to-admin)
//     const handleGroupReadStatusUpdate = (data) => {
//       const { groupId, readBy, updatedMessages } = data;

//       setMessages(prevMessages => {
//         return prevMessages.map(msg => {
//           // Find if this message was updated
//           const updatedMsg = updatedMessages.find(updated =>
//             updated._id === msg._id ||
//             (updated.content === msg.content &&
//               updated.sender === msg.sender &&
//               updated.groupId === msg.groupId &&
//               Math.abs(new Date(updated.createdAt) - new Date(msg.createdAt)) < 5000)
//           );

//           // If found, update the read status
//           if (updatedMsg) {
//             return { ...msg, isRead: true };
//           }

//           return msg;
//         });
//       });
//     };


//     const handleReceiveMessage = (message) => {
//       // for issue resolve
//       setMessages(prevMessages => {
//         // Check if message already exists
//         const messageExists = prevMessages.some(m =>
//           (m._id && m._id === message._id) ||
//           (m.content === message.content &&
//             m.sender === message.sender &&
//             ((isGroupChat && m.groupId === message.groupId) ||
//               (!isGroupChat && m.receiver === message.receiver)) &&
//             Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 5000)
//         );

//         if (messageExists) return prevMessages;

//         // Filter messages based on chat type
//         if (isGroupChat) {
//           // For group chat, only show messages from the selected group
//           if (message.groupId !== selectedGroup) {
//             return prevMessages;
//           }
//         }
//         else {
//           if (isAdmin && message.sender !== selectedUser?.username && message.receiver !== selectedUser?.username) {
//             return prevMessages;
//           }
//         }
//         // } else {
//         //   // For individual chat, filter as before
//         //   if (isAdmin && message.sender !== selectedUser.username && message.receiver !== selectedUser?.username) {
//         //     return prevMessages;
//         //   }
//         // }

//         const newMessages = [...prevMessages, message];
//         return removeDuplicateMessages(newMessages);
//       });

//       // Mark message as read
//       if (isGroupChat && message.groupId === selectedGroup) {
//         socket.emit('group:markRead', {
//           groupId: selectedGroup,
//           userId: username
//         });
//       } else if (!isGroupChat && message.receiver === username) {
//         if (!isAdmin || (isAdmin && selectedUser?.username === message.sender)) {
//           socket.emit('messages:markRead', {
//             sender: message.sender,
//             receiver: message.receiver
//           });
//         }
//       }

//       // Play notification sound
//       if (message.sender !== username) {
//         try {
//           const audio = new Audio('https://res.cloudinary.com/duqzgojyp/video/upload/v1737207753/tpnevoboszj1rnsdsto1.mp3');
//           audio.play().catch(err => console.log('Audio play error:', err));
//         } catch (error) {
//           console.log('Notification sound error:', error);
//         }
//       }
//     };

//     const handleMessageSent = (message) => {
//       setMessages(prevMessages => {
//         const index = prevMessages.findIndex(m =>
//         (m.content === message.content &&
//           m.sender === message.sender &&
//           ((isGroupChat && m.groupId === message.groupId) ||
//             (!isGroupChat && m.receiver === message.receiver)) &&
//           !m._id)
//         );

//         if (index !== -1) {
//           const newMessages = [...prevMessages];
//           newMessages[index] = message;
//           return removeDuplicateMessages(newMessages);
//         }

//         const exists = prevMessages.some(m => m._id === message._id);
//         if (exists) return prevMessages;

//         return removeDuplicateMessages([...prevMessages, message]);
//       });
//     };

//     // Handle group message events
//     const handleGroupMessageReceive = (message) => {
//       handleReceiveMessage(message);
//     };

//     const handleGroupMessageSent = (message) => {
//       handleMessageSent(message);
//     };

//     // Handle emoji reaction updates
//     const handleEmojiReactionUpdate = (data) => {
//       const { messageId, reactions } = data;
//       setMessages(prevMessages =>
//         prevMessages.map(msg =>
//           msg._id === messageId
//             ? { ...msg, reactions: reactions }
//             : msg
//         )
//       );
//     };

//     // Handle message deletion
//     const handleMessageDeleted = (data) => {
//       const { messageId, deletedBy, isAdmin } = data;
//       const deleteText = isAdmin
//         ? "This message was deleted by admin"
//         : `This message was deleted by ${deletedBy}`;

//       setMessages(prevMessages =>
//         prevMessages.map(msg =>
//           msg._id === messageId
//             ? {
//               ...msg,
//               content: deleteText,
//               isDeleted: true,
//               deletedBy: deletedBy,
//               file: undefined,
//               audio: undefined
//             }
//             : msg
//         )
//       );
//     };

//     // Add new socket listeners
//     socket.on('message:emojiReactionUpdate', handleEmojiReactionUpdate);
//     socket.on('message:deleted', handleMessageDeleted);

//     // close for now
//     // Set up socket event listeners
//     socket.on('messages:history', handleMessagesHistory);
//     socket.on('message:receive', handleReceiveMessage);
//     socket.on('message:sent', handleMessageSent);
//     socket.on('group:messageReceive', handleGroupMessageReceive);
//     socket.on('group:messageSent', handleGroupMessageSent);
//     socket.on('messages:readStatusUpdate', handleReadStatusUpdate); // New listener
//     socket.on('group:readStatusUpdate', handleGroupReadStatusUpdate);

//     // Cleanup
//     return () => {
//       socket.off('messages:history', handleMessagesHistory);
//       socket.off('message:receive', handleReceiveMessage);
//       socket.off('message:sent', handleMessageSent);
//       socket.off('group:messageReceive', handleGroupMessageReceive);
//       socket.off('group:messageSent', handleGroupMessageSent);
//       socket.off('messages:readStatusUpdate', handleReadStatusUpdate); // New cleanup
//       socket.off('message:emojiReactionUpdate', handleEmojiReactionUpdate);
//       socket.off('message:deleted', handleMessageDeleted);
//       socket.off('group:readStatusUpdate', handleGroupReadStatusUpdate);


//     };
//   }, [socket, username, isAdmin, selectedUser, selectedGroup, receiver, isGroupChat]);


//   // Function to handle emoji reaction
//   const handleEmojiReaction = (messageId, emoji) => {
//     if (!socket || !connected) return;

//     socket.emit('message:addEmojiReaction', {
//       messageId,
//       emoji,
//       username
//     });

//     setShowEmojiPicker(null); // Close emoji picker
//   };

//   // Function to handle message deletion
//   const handleDeleteMessage = (messageId) => {
//     if (!socket || !connected) return;

//     if (window.confirm('Are you sure you want to delete this message?')) {
//       socket.emit('message:delete', {
//         messageId,
//         deletedBy: username,
//         isAdmin
//       });
//     }
//   };



//   // for realtime read status updates
//   // Clear messages and reload when selected user/group changes
//   useEffect(() => {
//     if (socket && connected) {
//       setLoading(true);
//       setMessages([]);

//       if (isGroupChat && selectedGroup) {
//         socket.emit('group:join', selectedGroup);
//       } else if (isAdmin && selectedUser?.username) {
//         socket.emit('admin:selectUser', selectedUser?.username);
//       } else {
//         socket.emit('user:adminChat', username);
//       }
//     }
//   }, [isAdmin, selectedUser, selectedGroup, socket, connected, isGroupChat]);

//   const handleTyping = () => {
//     if (socket && connected) {
//       if (isGroupChat) {
//         socket.emit('group:typing', {
//           groupId: selectedGroup,
//           sender: username
//         });
//       } else {
//         socket.emit('user:typing', {
//           sender: username,
//           receiver
//         });
//       }
//     }
//   };

//   const handleStopTyping = () => {
//     if (socket && connected) {
//       if (isGroupChat) {
//         socket.emit('group:stopTyping', {
//           groupId: selectedGroup,
//           sender: username
//         });
//       } else {
//         socket.emit('user:stopTyping', {
//           sender: username,
//           receiver
//         });
//       }
//     }
//   };

//   const handleInputChange = (e) => {
//     setNewMessage(e.target.value);

//     if (typingTimeout.current) {
//       clearTimeout(typingTimeout.current);
//     }

//     handleTyping();

//     typingTimeout.current = setTimeout(() => {
//       handleStopTyping();
//     }, 2000);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setReplyingTo(null); // Clear replying state on send

//     if (!newMessage.trim() || !socket || !connected) return;

//     handleStopTyping();

//     const tempMessage = {
//       content: newMessage,
//       sender: username,
//       receiver: isGroupChat ? null : receiver,
//       groupId: isGroupChat ? selectedGroup : null,
//       createdAt: new Date().toISOString(),
//       isRead: false
//     };

//     setMessages(prevMessages => {
//       const isDuplicate = prevMessages.some(m =>
//         m.content === tempMessage.content &&
//         m.sender === tempMessage.sender &&
//         ((isGroupChat && m.groupId === tempMessage.groupId) ||
//           (!isGroupChat && m.receiver === tempMessage.receiver)) &&
//         Math.abs(new Date(m.createdAt) - new Date(tempMessage.createdAt)) < 5000
//       );

//       if (!isDuplicate) {
//         return [...prevMessages, tempMessage];
//       }
//       return prevMessages;
//     });

//     // Send message via socket
//     if (isGroupChat) {
//       socket.emit('group:sendMessage', {
//         content: newMessage,
//         sender: username,
//         groupId: selectedGroup,
//         replyTo: replyingTo ? {
//           messageId: replyingTo._id,
//           content: replyingTo.content,
//           sender: replyingTo.sender
//         } : null
//       });
//     } else {
//       socket.emit('message:send', {
//         content: newMessage,
//         sender: username,
//         receiver,
//         replyTo: replyingTo ? {
//           messageId: replyingTo._id,
//           content: replyingTo.content,
//           sender: replyingTo.sender
//         } : null
//       });
//     }

//     setNewMessage('');
//     if (typingTimeout.current) {
//       clearTimeout(typingTimeout.current);
//     }
//   };

//   const handleFileUpload = (fileData) => {
//     if (!socket || !connected) return;

//     const fileDescription = fileData.type === 'image'
//       ? `[Image: ${fileData.name}]`
//       : `[Document: ${fileData.name}]`;

//     const fileMessage = {
//       content: fileDescription,
//       sender: username,
//       receiver: isGroupChat ? null : receiver,
//       groupId: isGroupChat ? selectedGroup : null,
//       createdAt: new Date().toISOString(),
//       isRead: false,
//       file: fileData
//     };

//     setMessages(prev => [...prev, fileMessage]);

//     if (isGroupChat) {
//       socket.emit('group:sendMessage', {
//         content: fileDescription,
//         sender: username,
//         groupId: selectedGroup,
//         file: fileData,
//         replyTo: replyingTo ? {
//           messageId: replyingTo._id,
//           content: replyingTo.content,
//           sender: replyingTo.sender
//         } : null
//       });
//     } else {
//       socket.emit('message:send', {
//         content: fileDescription,
//         sender: username,
//         receiver,
//         file: fileData,
//         replyTo: replyingTo ? {
//           messageId: replyingTo._id,
//           content: replyingTo.content,
//           sender: replyingTo.sender
//         } : null
//       });
//     }
//   };

//   const handleVoiceUpload = (voiceData) => {
//     if (!socket || !connected) return;

//     const voiceDescription = `[Voice: ${voiceData.name}]`;

//     const voiceMessage = {
//       content: voiceDescription,
//       sender: username,
//       receiver: isGroupChat ? null : receiver,
//       groupId: isGroupChat ? selectedGroup : null,
//       createdAt: new Date().toISOString(),
//       isRead: false,
//       audio: voiceData
//     };

//     setMessages(prev => [...prev, voiceMessage]);

//     if (isGroupChat) {
//       socket.emit('group:sendMessage', {
//         content: voiceDescription,
//         sender: username,
//         groupId: selectedGroup,
//         audio: voiceData,
//         replyTo: replyingTo ? {
//           messageId: replyingTo._id,
//           content: replyingTo.content,
//           sender: replyingTo.sender
//         } : null
//       });
//     } else {
//       socket.emit('message:send', {
//         content: voiceDescription,
//         sender: username,
//         receiver,
//         audio: voiceData,
//         replyTo: replyingTo ? {
//           messageId: replyingTo._id,
//           content: replyingTo.content,
//           sender: replyingTo.sender
//         } : null
//       });
//     }
//   };
//   // close for now


//   // If admin with no selected user or group
//   if (isAdmin && !selectedUser && !selectedGroup) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full bg-[#f0f2f5] ">

//         <div className="flex justify-center">
//           <img
//             src="/whatsapp.png"
//             alt="WhatsApp Logo"
//             className="h-40 w-40"
//           />
//         </div>
//         <p className="text-gray-500 mt-10 text-2xl">Select a user or group to start chatting</p>
//       </div>
//     );
//   }

//   const chatBgStyle = {
//     backgroundImage: `url('/chat-bg.jpg')`,
//     backgroundRepeat: 'repeat',
//     backgroundColor: '#efeae2',
//   };

//   // Get current chat display name
//   const getChatDisplayName = () => {
//     if (isGroupChat) {
//       const group = groups.find(g => g._id === selectedGroup);
//       return group ? group.name : 'Group';
//     }
//     return isAdmin ? selectedUser?.username : 'Admin Support';
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {/* Mobile-optimized header component */}
//       <div className="flex fixed w-full top-0 right-0 z-40 md:z-0 md:static md:w-auto items-center justify-between p-2.5 md:p-3 bg-[#008069] md:bg-[#f0f2f5] border-b border-gray-200 text-white md:text-black">
//         <div className="flex items-center">
//           {/* Back button for mobile */}
//           {onBackClick && (
//             <button
//               onClick={onBackClick}
//               className="p-1 mr-2 text-white md:hidden"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </button>
//           )}

//           <div className="relative">
//             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-medium overflow-hidden">
//               {isGroupChat ? (
//                 <Users className="h-5 w-5" />
//               ) : (
//                 <>
//                   {isAdmin ? (
//                     // Admin profile picture or fallback

//                     selectedUser?.profilePicture ? (
//                       <img
//                         src={selectedUser.profilePicture}
//                         alt={`${selectedUser}'s profile picture`}
//                         className="w-full h-full object-cover rounded-full"
//                       />
//                     ) : (
//                       selectedUser?.username?.charAt(0).toUpperCase()
//                     )
//                   ) : (
//                     // Selected user profile picture or fallback
//                     admin?.profilePicture ? (
//                       <img
//                         src={admin.profilePicture}
//                         alt="Admin profile picture"
//                         className="w-full h-full object-cover rounded-full"
//                       />
//                     ) : (
//                       'A'
//                     )
//                   )}
//                 </>
//               )}
//             </div>
//             {!isAdmin && !isGroupChat && adminOnline && (
//               <div className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-[#008069] md:border-white"></div>
//             )}
//           </div>

//           <div className="ml-2 md:ml-3">
//             <p className="text-xs md:text-sm font-medium text-white md:text-gray-900 flex items-center gap-1">
//               {getChatDisplayName()}
//               {!isAdmin && !isGroupChat && (
//                 <img
//                   src="/blue-tick.png"
//                   alt="Blue Tick"
//                   className="w-3 h-3 md:w-5 md:h-5"
//                 />
//               )}
//             </p>
//             {typing ? (
//               <p className="text-xs text-gray-200 md:text-gray-500 animate-pulse">typing...</p>
//             ) : (
//               <p className="text-xs text-gray-200 md:text-gray-500">
//                 {isGroupChat && (
//                   `${groups.find(g => g._id === selectedGroup)?.members?.length || 0} members`
//                 )}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Action buttons */}
//         <div className="flex items-center space-x-3">
//           {/* Options menu */}
//           {isAdmin && isMobile && (
//             <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <button className="text-white md:text-gray-800 p-1">
//                 <MoreVertical className="h-5 w-5" />
//               </button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               {isAdmin && selectedUser && !isGroupChat && (
//                 <DropdownMenuItem onClick={() => {
//                   const userToEdit = users.find(user => user.username === selectedUser);
//                   setUserToEdit(userToEdit);
//                   setIsEditMode(true);
//                   setDialogOpen(true);
//                 }}>
//                   <Edit className="h-4 w-4 mr-2" />
//                   Edit User
//                 </DropdownMenuItem>
//               )}
//               { isAdmin && selectedGroup && isGroupChat && (
//                 <DropdownMenuItem
//                       className={`flex items-center gap-2 ${isGroupEditMode ? 'cursor-not-allowed opacity-50' : ''}`}
//                       onClick={() => {
//                         const groupToEdit = groups.find(group => group._id === selectedGroup);
//                         setGroupToEdit(groupToEdit);
//                         setIsGroupEditMode(true);
//                         setCreateGroupOpen(true);
//                       }}>
//                   <Edit className="h-4 w-4 mr-2" />
//                   Edit Group
//                       </DropdownMenuItem>
//               )}

//             </DropdownMenuContent>
//           </DropdownMenu>
            
//           )}

//           {/* Edit button - only show for admin when a user is selected (desktop only) */}
//           {isAdmin && selectedUser && !isGroupChat && (
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => {
//                 const userToEdit = users.find(user => user.username === selectedUser?.username);
//                 console.log('userToEdit', userToEdit)
//                 setUserToEdit(userToEdit);
//                 setIsEditMode(true);
//                 setDialogOpen(true);
//               }}
//               className="hidden md:flex items-center gap-2"
//             >
//               <Edit className="h-4 w-4" />
//               Edit
//             </Button>
//           )}
//           {isAdmin && selectedGroup && isGroupChat && (
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => {
//                 console.log('selectedGroup', selectedGroup)
//                 console.log('groups', groups)
//                 const groupToEdit = groups.find(group => group._id === selectedGroup);
//                 console.log('groupToEdit', groupToEdit)
//                 setGroupToEdit(groupToEdit);
              
//                 setIsGroupEditMode(true);
//                 setCreateGroupOpen(true);
//               }}
//               className="hidden md:flex items-center gap-2"
//             >
//               <Edit className="h-4 w-4" />
//               Edit Group
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Messages area */}
//       <div className="flex-1 p-2 pt-4 mb-12  mt-12 md:mt-0 md:mb-0 md:p-4 overflow-y-auto" style={chatBgStyle}>
//         {loading ? (
//           <div className="flex items-center justify-center h-full">
//             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00a884]"></div>
//           </div>
//         ) : messages.length === 0 ? (
//           <div className="flex items-center justify-center h-full">
//             <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm text-center">
//               <p className="text-gray-500 text-sm md:text-base">No messages yet. Start the conversation!</p>
//             </div>
//           </div>
//         ) : (
//           <>
//             {messages.map((message, index) => (
//               <div key={index} id={`message-${message._id}`}>
//                 <MessageBubble
//                   key={index}
//                   message={message}
//                   isOwnMessage={message.sender === username}
//                   isGroupChat={isGroupChat}
//                   isAdmin={isAdmin}
//                   showEmojiPicker={showEmojiPicker}
//                   setShowEmojiPicker={setShowEmojiPicker}
//                   handleDeleteMessage={handleDeleteMessage}
//                   handleReplyMessage={handleReplyMessage}
//                   handleEmojiReaction={handleEmojiReaction}
//                   scrollToMessage={scrollToMessage}
//                   username={username}
//                   showDropdown={showDropdown}
//                   setShowDropdown={setShowDropdown}
//                   isMobile={isMobile}
//                   setIsMobile={setIsMobile}

//                 />
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </>
//         )}
//       </div>

//       {/* Error message */}
//       {error && (
//         <div className="px-3 py-1.5 md:px-4 md:py-2 bg-red-100 text-red-700 text-xs md:text-sm">
//           {error}
//         </div>
//       )}

//       {/* // Add reply UI above message input */}
//       {replyingTo && (
//         <div className=" z-50  px-4 py-2 bg-gray-100 border-l-4 border-blue-500 mx-4 rounded fixed w-full  bottom-12 md:bottom-0 right-0 md:static md:w-auto">
//           <div className=" border-l-4 border-blue-500 rounded  pl-3 md:p-0 md:border-0 flex justify-between items-start">
//             <div className="flex-1">
//               <p className="text-xs text-blue-600 font-medium">
//                 Replying to {replyingTo.sender}
//               </p>
//               <p className="text-sm text-gray-600 truncate">
//                 {replyingTo.content}
//               </p>
//             </div>
//             <button
//               onClick={() => setReplyingTo(null)}
//               className="text-gray-400 hover:text-gray-600 cursor-pointer"
//             >
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       )}
//       {/* Message input - Mobile optimized */}
//       <form onSubmit={handleSubmit} className="p-1.5 md:p-2 bg-[#f0f2f5] fixed w-full bottom-0 right-0 md:static md:w-auto">
//         <div className="flex items-center rounded-full bg-white p-1 " >
         

//           <FileUpload onUpload={handleFileUpload} />

//           <input
//             type="text"
//             ref={messageInputRef}
//             value={newMessage}
//             onChange={handleInputChange}
//             onBlur={handleStopTyping}
//             placeholder={connected ? "Type a message" : "Connecting..."}
//             disabled={!connected}
//             className="flex-1 px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base rounded-full focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
//           />

//           {newMessage ? (
//             <button
//               type="submit"
//               disabled={!newMessage.trim() || !connected}
//               className="p-1.5 md:p-2 text-white bg-[#00a884] rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <Send className="h-5 w-5" />
//             </button>
//           ) : (
//             <>
//               <FileUpload onUpload={handleFileUpload} showCameraButton={true} />
//               <VoiceRecorder onSendVoice={handleVoiceUpload} />
//             </>
//           )}
//         </div>

//         {!connected && (
//           <p className="mt-1 md:mt-2 text-xs text-center text-red-500">
//             Disconnected from server. Trying to reconnect...
//           </p>
//         )}
//       </form>

//       {/* Create User Dialog */}
//       <Dialog open={dialogOpen}
//         onOpenChange={(isOpen) => {
//           setDialogOpen(isOpen);
//           if (!isOpen) {
//             setIsEditMode(false);
//             setUserToEdit(null);
//           }
//         }}
//       >
//         <CreateUser
//           socket={socket}
//           dialogOpen={dialogOpen}
//           setDialogOpen={setDialogOpen}
//           newUsername={newUsername}
//           setNewUsername={setNewUsername}
//           newPassword={newPassword}
//           setNewPassword={setNewPassword}
//           isEditMode={isEditMode}
//           userToEdit={userToEdit}
//           setIsEditMode={setIsEditMode}
//           setUserToEdit={setUserToEdit}
//         />
//       </Dialog>

//       {/* Create Group Dialog */}
//       <CreateGroupDialog
//         isOpen={createGroupOpen}
//         onClose={() => setCreateGroupOpen(false)}
//         users={users}
//         socket={socket}
//         username={username}
//         isEdit={isGroupEditMode}
//         setIsGroupEditMode={setIsGroupEditMode}
//         groupToEdit={groupToEdit}
//         setGroupToEdit={setGroupToEdit}

//       />

//     </div>
//   );
// }



'use client';

import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import ReplyPreview from './ReplyPreview';
import MessageInput from './MessageInput';
import EmptyState from './EmptyState';
import DialogContainer from './DialogContainer';

export default function ChatInterface({
  isAdmin = false,
  selectedUser = null,
  selectedGroup = null,
  admin = null,
  users = null,
  groups = [],
  onBackClick = null,
  chatType = 'user',
}) {
  const {
    socket,
    connected,
    messages,
    loading,
    typing,
    error,
    adminOnline,
    replyingTo,
    setReplyingTo,
    showEmojiPicker,
    setShowEmojiPicker,
    showDropdown,
    setShowDropdown,
    dialogOpen,
    setDialogOpen,
    userToEdit,
    setUserToEdit,
    isEditMode,
    setIsEditMode,
    newUsername,
    setNewUsername,
    newPassword,
    setNewPassword,
    createGroupOpen,
    setCreateGroupOpen,
    isGroupEditMode,
    setIsGroupEditMode,
    groupToEdit,
    setGroupToEdit,
    typingTimeout,
    sendMessage,
    sendFileMessage,
    sendVoiceMessage,
    handleTyping,
    handleStopTyping,
    handleEmojiReaction,
    handleDeleteMessage,
    clearMessages,
    setupSocketListeners
  } = useSocket();

  const messageInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const username = isAdmin ? 'admin' : localStorage.getItem('chat_username');
  const receiver = chatType === 'group' ? selectedGroup : (isAdmin ? selectedUser?.username : 'admin');
  const isGroupChat = chatType === 'group';

  // Focus input when loading completes
  useEffect(() => {
    if (!loading) {
      messageInputRef.current?.focus();
    }
  }, [loading, isAdmin, selectedUser, selectedGroup]);

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    const cleanup = setupSocketListeners(
      socket,
      username,
      isAdmin,
      selectedUser,
      selectedGroup,
      isGroupChat
    );

    return cleanup;
  }, [socket, username, isAdmin, selectedUser, selectedGroup, isGroupChat, setupSocketListeners]);

  // Handle chat selection changes
  useEffect(() => {
    if (socket && connected) {
      clearMessages();

      if (isGroupChat && selectedGroup) {
        socket.emit('group:join', selectedGroup);
      } else if (isAdmin && selectedUser?.username) {
        socket.emit('admin:selectUser', selectedUser?.username);
      } else {
        socket.emit('user:adminChat', username);
      }
    }
  }, [isAdmin, selectedUser, selectedGroup, socket, connected, isGroupChat, clearMessages]);

  // Handle reply
  const handleReplyMessage = (replyToMessage) => {
    setReplyingTo(replyToMessage);
    messageInputRef.current?.focus();
  };

  // Handle typing
  const handleInputChange = (value) => {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    handleTyping({
      isGroupChat,
      selectedGroup,
      receiver,
      username
    });

    typingTimeout.current = setTimeout(() => {
      handleStopTyping({
        isGroupChat,
        selectedGroup,
        receiver,
        username
      });
    }, 2000);
  };

  const handleStopTypingAction = () => {
    handleStopTyping({
      isGroupChat,
      selectedGroup,
      receiver,
      username
    });
  };

  // Handle message submission
  const handleSubmit = (content) => {
    setReplyingTo(null);
    handleStopTypingAction();

    sendMessage({
      content,
      isGroupChat,
      selectedGroup,
      receiver,
      username,
      replyTo: replyingTo ? {
        messageId: replyingTo._id,
        content: replyingTo.content,
        sender: replyingTo.sender
      } : null
    });

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
  };

  // Handle file upload
  const handleFileUpload = (fileData) => {
    sendFileMessage(fileData, {
      isGroupChat,
      selectedGroup,
      receiver,
      username,
      replyTo: replyingTo ? {
        messageId: replyingTo._id,
        content: replyingTo.content,
        sender: replyingTo.sender
      } : null
    });
  };

  // Handle voice upload
  const handleVoiceUpload = (voiceData) => {
    sendVoiceMessage(voiceData, {
      isGroupChat,
      selectedGroup,
      receiver,
      username,
      replyTo: replyingTo ? {
        messageId: replyingTo._id,
        content: replyingTo.content,
        sender: replyingTo.sender
      } : null
    });
  };

  // Handle emoji reaction
  const handleEmojiReactionAction = (messageId, emoji) => {
    handleEmojiReaction(messageId, emoji, username);
    setShowEmojiPicker(null);
  };

  // Handle message deletion
  const handleDeleteMessageAction = (messageId) => {
    handleDeleteMessage(messageId, username, isAdmin);
  };

  // Handle edit actions
  const handleEditUser = () => {
    const userToEdit = users.find(user => user.username === selectedUser?.username);
    setUserToEdit(userToEdit);
    setIsEditMode(true);
    setDialogOpen(true);
  };

  const handleEditGroup = () => {
    const groupToEdit = groups.find(group => group._id === selectedGroup);
    setGroupToEdit(groupToEdit);
    setIsGroupEditMode(true);
    setCreateGroupOpen(true);
  };

  // Show empty state if admin with no selection
  if (isAdmin && !selectedUser && !selectedGroup) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        isAdmin={isAdmin}
        selectedUser={selectedUser}
        selectedGroup={selectedGroup}
        admin={admin}
        groups={groups}
        onBackClick={onBackClick}
        chatType={chatType}
        typing={typing}
        adminOnline={adminOnline}
        isMobile={isMobile}
        onEditUser={handleEditUser}
        onEditGroup={handleEditGroup}
      />

      <MessagesList
        messages={messages}
        loading={loading}
        username={username}
        isGroupChat={isGroupChat}
        isAdmin={isAdmin}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        handleDeleteMessage={handleDeleteMessageAction}
        handleReplyMessage={handleReplyMessage}
        handleEmojiReaction={handleEmojiReactionAction}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        isMobile={isMobile}
        setIsMobile={setIsMobile}
      />

      {error && (
        <div className="px-3 py-1.5 md:px-4 md:py-2 bg-red-100 text-red-700 text-xs md:text-sm">
          {error}
        </div>
      )}

      <ReplyPreview
        replyingTo={replyingTo}
        onCancel={() => setReplyingTo(null)}
      />

      <MessageInput
        connected={connected}
        onSubmit={handleSubmit}
        onFileUpload={handleFileUpload}
        onVoiceUpload={handleVoiceUpload}
        onInputChange={handleInputChange}
        onStopTyping={handleStopTypingAction}
        messageInputRef={messageInputRef}
      />

      <DialogContainer
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        createGroupOpen={createGroupOpen}
        setCreateGroupOpen={setCreateGroupOpen}
        socket={socket}
        newUsername={newUsername}
        setNewUsername={setNewUsername}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        userToEdit={userToEdit}
        setUserToEdit={setUserToEdit}
        users={users}
        username={username}
        isGroupEditMode={isGroupEditMode}
        setIsGroupEditMode={setIsGroupEditMode}
        groupToEdit={groupToEdit}
        setGroupToEdit={setGroupToEdit}
      />
    </div>
  );
}