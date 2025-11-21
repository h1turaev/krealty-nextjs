import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import SendIcon from '@mui/icons-material/Send';
import { Avatar, Box, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import { Messages } from '../config';
import { useDarkMode } from '../hooks/useDarkMode';
import { showError } from '../toast';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

const Chat = () => {
  const chatContentRef = useRef<HTMLDivElement>(null);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [openButton, setOpenButton] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const router = useRouter();
  const { isDarkMode } = useDarkMode();

  /** LIFECYCLES **/
  useEffect(() => {
    const timeoutId = setTimeout(() => setOpenButton(true), 100);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    setOpenButton(false);
  }, [router.pathname]);

  /** HANDLERS **/
  const handleOpenChat = () => {
    setOpen((prevState) => !prevState);
  };

  const getInputMessageHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  }, []);

  const getKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) {
      showError(Messages.error4);
      return;
    }

    // AI Chat Mode
    const userMessage: AIMessage = {
      role: 'user',
      content: messageInput,
    };

    setAiMessages((prev) => [...prev, userMessage]);
    setMessageInput('');
    setIsAiLoading(true);

    try {
      // Limit messages sent to API (only send last 8 messages to save tokens)
      const messagesToSend =
        aiMessages.length > 8
          ? [...aiMessages.slice(-8), userMessage]
          : [...aiMessages, userMessage];

      const response = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSend,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show user-friendly error message from API
        const errorMessage =
          data.userMessage || data.message || 'Failed to get AI response. Please try again.';

        // Add error message as AI response so user can see it
        const errorAiMessage: AIMessage = {
          role: 'assistant',
          content: errorMessage,
        };
        setAiMessages((prev) => [...prev, errorAiMessage]);

        // Also show alert for important errors
        if (response.status === 429 || response.status === 401) {
          showError(errorMessage);
        }
        return;
      }

      const aiMessage: AIMessage = {
        role: 'assistant',
        content: data.message,
      };

      setAiMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('AI chat error:', error);
      const errorMessage = 'Network error. Please check your connection and try again.';

      // Add error message as AI response
      const errorAiMessage: AIMessage = {
        role: 'assistant',
        content: errorMessage,
      };
      setAiMessages((prev) => [...prev, errorAiMessage]);

      showError(errorMessage);
    } finally {
      setIsAiLoading(false);
    }
  };

  const SimpleRobotIcon = ({
    size = 24,
    color = '#ffffff',
    bgColor = '#007AFF',
    animated = false,
  }: {
    size?: number;
    color?: string;
    bgColor?: string;
    animated?: boolean;
  }) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animated ? 'animated-robot' : ''}
        style={{ display: 'block' }}
      >
        {/* Robot Head - Yumaloq bosh */}
        <rect
          x="6"
          y="6"
          width="12"
          height="12"
          rx="3"
          fill={bgColor}
          stroke={color}
          strokeWidth="1.5"
        />

        {/* Quloqlar - Ikki yonida */}
        <rect
          x="3"
          y="9"
          width="3"
          height="6"
          rx="1.5"
          fill={bgColor}
          stroke={color}
          strokeWidth="1.5"
        />
        <rect
          x="18"
          y="9"
          width="3"
          height="6"
          rx="1.5"
          fill={bgColor}
          stroke={color}
          strokeWidth="1.5"
        />

        {/* Antenna - Yuqorida */}
        <line
          x1="12"
          y1="6"
          x2="12"
          y2="3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="3" r="1.5" fill={color} />

        {/* Ko'zlar - 2 ta oq nuqta */}
        <circle cx="9.5" cy="10.5" r="1.2" fill={color} />
        <circle cx="14.5" cy="10.5" r="1.2" fill={color} />
      </svg>
    );
  };

  // AI Chat Logo Component - Faqat "AI Assistant" text
  const AIChatLogo = useMemo(() => {
    return (
      <Box className="ai-chat-logo" component="div">
        <span className="ai-chat-text">AI Assistant</span>
      </Box>
    );
  }, [isDarkMode]);

  return (
    <Stack className="chatting">
      {openButton && (
        <button
          className={`chat-button ${open ? 'chat-button-close' : ''}`}
          onClick={handleOpenChat}
        >
          {open ? (
            <CloseFullscreenIcon style={{ fontSize: '24px', color: '#ffffff' }} />
          ) : (
            <Box className="chat-button-content">
              <SimpleRobotIcon size={30} color="#ffffff" bgColor="#007AFF" animated={false} />
              <span className="chat-button-text">AI Chat</span>
            </Box>
          )}
        </button>
      )}

      <Stack className={`chat-frame ${open ? 'open' : ''}`}>
        <Box className="chat-top" component="div">
          {AIChatLogo}
        </Box>

        <Box className="chat-content" id="chat-content" ref={chatContentRef} component="div">
          <ScrollableFeed>
            <Stack className="chat-main">
              <Box
                flexDirection="row"
                style={{ display: 'flex' }}
                sx={{ m: '10px 0px' }}
                component="div"
              >
                <div className="welcome">
                  Hello! I'm your AI assistant. Ask me anything about properties or interior design!
                </div>
              </Box>

              {aiMessages.map((message: AIMessage, index: number) => {
                const isUser = message.role === 'user';

                return isUser ? (
                  <Box
                    key={index}
                    component="div"
                    flexDirection="row"
                    style={{ display: 'flex' }}
                    alignItems="flex-end"
                    justifyContent="flex-end"
                    sx={{ m: '10px 0px' }}
                  >
                    <div className="msg-right">{message.content}</div>
                  </Box>
                ) : (
                  <Box
                    key={index}
                    flexDirection="row"
                    style={{ display: 'flex' }}
                    sx={{ m: '10px 0px' }}
                    component="div"
                  >
                    <Avatar alt="AI Assistant" className="ai-avatar">
                      <SimpleRobotIcon
                        size={18}
                        color="#ffffff"
                        bgColor="#007AFF"
                        animated={true}
                      />
                    </Avatar>
                    <div className="msg-left">{message.content}</div>
                  </Box>
                );
              })}

              {isAiLoading && (
                <Box
                  flexDirection="row"
                  style={{ display: 'flex' }}
                  sx={{ m: '10px 0px' }}
                  component="div"
                >
                  <Avatar alt="AI Assistant" className="ai-avatar">
                    <SimpleRobotIcon size={30} color="#ffffff" bgColor="#007AFF" animated={true} />
                  </Avatar>
                  <div className="msg-left">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </Box>
              )}
            </Stack>
          </ScrollableFeed>
        </Box>

        <Box className="chat-bott" component="div">
          <input
            type="text"
            name="message"
            className="msg-input"
            placeholder="Ask about properties or interior design..."
            value={messageInput}
            onChange={getInputMessageHandler}
            onKeyDown={getKeyHandler}
            disabled={isAiLoading}
          />
          <button className="send-msg-btn" onClick={sendMessage} disabled={isAiLoading}>
            <SendIcon style={{ color: '#ffffff' }} />
          </button>
        </Box>
      </Stack>
    </Stack>
  );
};

export default Chat;
