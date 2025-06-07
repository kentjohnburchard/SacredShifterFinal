import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useChakra } from '../../context/ChakraContext';
import { circleMembersData, messageScrollsData } from '../../data/sacredCircleData';
import { Send, Image, Smile, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessageScrollsProps {
  onSendMessage?: (message: string, emojiIntent: string, sigilId?: string) => void;
  className?: string;
}

const MessageScrolls: React.FC<MessageScrollsProps> = ({
  onSendMessage,
  className = ''
}) => {
  const { user } = useAuth();
  const { chakraState } = useChakra();
  const [message, setMessage] = useState('');
  const [emojiIntent, setEmojiIntent] = useState('✨');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageScrollsData]);
  
  // Handle send message
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    
    // Simulate sending delay
    setTimeout(() => {
      if (onSendMessage) {
        onSendMessage(message, emojiIntent);
      }
      
      setMessage('');
      setIsSending(false);
    }, 500);
  };
  
  // Get member by ID
  const getMemberById = (id: string) => {
    return circleMembersData.find(m => m.id === id);
  };
  
  // Get timeline color
  const getTimelineColor = (timeline: string): string => {
    switch(timeline) {
      case 'past': return 'var(--chakra-root)';
      case 'present': return 'var(--chakra-heart)';
      case 'future': return 'var(--chakra-crown)';
      default: return chakraState.color;
    }
  };
  
  // Available emoji intents
  const emojiIntents = ['✨', '🌊', '💗', '🔥', '🌱', '👁️', '🌀', '🧿', '🕊️', '🌈'];
  
  return (
    <div className={`bg-dark-200 rounded-2xl border border-dark-300 flex flex-col h-[500px] ${className}`}>
      <div className="p-4 border-b border-dark-300">
        <h3 className="text-lg font-medium text-white">Message Scrolls</h3>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messageScrollsData.map((msg) => {
          const sender = getMemberById(msg.senderId);
          const isCurrentUser = msg.senderId === user?.id;
          
          return (
            <motion.div
              key={msg.messageId}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {!isCurrentUser && (
                <div className="flex-shrink-0 mr-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {sender?.avatarUrl ? (
                      <img 
                        src={sender.avatarUrl} 
                        alt={sender.displayName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-dark-400 flex items-center justify-center text-gray-300">
                        {sender?.displayName.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div 
                className={`max-w-xs rounded-2xl px-4 py-2 ${
                  isCurrentUser
                    ? 'bg-dark-100 text-white ml-12'
                    : 'mr-12'
                }`}
                style={isCurrentUser ? undefined : { 
                  backgroundColor: `${getTimelineColor(msg.timelineVibe)}20`,
                  color: 'white'
                }}
              >
                {!isCurrentUser && (
                  <div className="text-xs font-medium mb-1\" style={{ color: getTimelineColor(msg.timelineVibe) }}>
                    {sender?.displayName || 'Unknown'}
                  </div>
                )}
                
                <div className="flex items-start">
                  <span className="mr-2 text-lg leading-none">{msg.emojiIntent}</span>
                  <p className="text-sm flex-1">{msg.text}</p>
                </div>
                
                {msg.sigilAttached && (
                  <div 
                    className="mt-2 p-2 rounded-lg text-xs"
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                  >
                    Sigil attached: {msg.sigilAttached}
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs opacity-60">
                    {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                  </span>
                  
                  <span 
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: `${getTimelineColor(msg.timelineVibe)}30`,
                      color: getTimelineColor(msg.timelineVibe)
                    }}
                  >
                    {msg.timelineVibe}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="p-4 border-t border-dark-300">
        {/* Emoji intent selector */}
        <div className="mb-2 flex space-x-1 overflow-x-auto pb-2">
          {emojiIntents.map(emoji => (
            <button
              key={emoji}
              onClick={() => setEmojiIntent(emoji)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                emojiIntent === emoji 
                  ? 'bg-dark-100 ring-2'
                  : 'bg-dark-300 hover:bg-dark-400'
              }`}
              style={{ 
                ringColor: emojiIntent === emoji ? chakraState.color : undefined
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
        
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-dark-300 border border-dark-400 rounded-full focus:outline-none focus:ring-2"
            style={{ focusRingColor: chakraState.color }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isSending}
          />
          
          <button
            className="ml-2 p-2 rounded-full bg-dark-300 text-gray-400 hover:text-gray-200"
          >
            <Image size={18} />
          </button>
          
          <button
            className="ml-2 p-2 rounded-full bg-dark-300 text-gray-400 hover:text-gray-200"
          >
            <Smile size={18} />
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={isSending || !message.trim()}
            className="ml-2 p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: chakraState.color,
              color: 'white'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageScrolls;