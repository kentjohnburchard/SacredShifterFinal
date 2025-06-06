import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChakra } from '../../context/ChakraContext';
import { supabase } from '../../lib/supabase';
import { CircleMessage, UserProfile } from '../../types';
import { motion } from 'framer-motion';

interface CircleChatProps {
  circleId: string;
}

const CircleChat: React.FC<CircleChatProps> = ({ circleId }) => {
  const { user } = useAuth();
  const { chakraState } = useChakra();
  
  const [messages, setMessages] = useState<CircleMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('circle_messages')
          .select(`
            *,
            user:user_id(id, display_name, avatar_url)
          `)
          .eq('circle_id', circleId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    
    fetchMessages();
  }, [circleId]);
  
  // Subscribe to new messages
  useEffect(() => {
    const subscription = supabase
      .channel('public:circle_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'circle_messages',
        filter: `circle_id=eq.${circleId}`
      }, async (payload) => {
        // Fetch user info for the new message
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .eq('id', payload.new.user_id)
          .single();
          
        if (!userError && userData) {
          const newMessage = {
            ...payload.new,
            user: userData as UserProfile
          };
          
          setMessages(prev => [...prev, newMessage]);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [circleId]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;
    
    try {
      setIsSending(true);
      
      const { error } = await supabase
        .from('circle_messages')
        .insert({
          circle_id: circleId,
          user_id: user.id,
          content: newMessage.trim()
        });
        
      if (error) throw error;
      
      // The message will be added via the subscription
      setNewMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[500px] bg-dark-200 rounded-2xl border border-dark-300 shadow-md overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageItem 
              key={message.id} 
              message={message} 
              isCurrentUser={message.user_id === user?.id}
              chakraColor={chakraState.color}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t border-dark-300">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
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

interface MessageItemProps {
  message: CircleMessage;
  isCurrentUser: boolean;
  chakraColor: string;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
  chakraColor
}) => {
  return (
    <motion.div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-400 flex items-center justify-center">
            {message.user?.avatar_url ? (
              <img 
                src={message.user.avatar_url} 
                alt={message.user.display_name || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
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
          backgroundColor: `${chakraColor}20`,
          color: 'white'
        }}
      >
        {!isCurrentUser && (
          <div className="text-xs font-medium mb-1\" style={{ color: chakraColor }}>
            {message.user?.display_name || 'Anonymous'}
          </div>
        )}
        <p className="text-sm">{message.content}</p>
        <span className="text-xs opacity-60 mt-1 block text-right">
          {new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
    </motion.div>
  );
};

export default CircleChat;