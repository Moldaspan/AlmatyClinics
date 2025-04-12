import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';
import axios from 'axios';

interface Message {
    from: 'user' | 'bot';
    text: string;
}

const ChatBot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { from: 'bot', text: 'Привет! Я помощник HealthMap. Задай вопрос 🏥' },
    ]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (): Promise<void> => {
        if (!input.trim()) return;

        const newMessages: Message[] = [...messages, { from: 'user', text: input }];
        setMessages(newMessages);
        setInput('');

        try {
            const res = await axios.post<{ reply: string }>('http://localhost:8000/api/chatbot/ask/',
                { message: input });

            setMessages([...newMessages, { from: 'bot', text: res.data.reply }]);
        } catch (err) {
            setMessages([...newMessages, { from: 'bot', text: 'Произошла ошибка при получении ответа 😥' }]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
        <div className="chat-wrapper">
            <div className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
                💬
            </div>

            {isOpen && (
                <div className="chat-box">
                    <div className="messages">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={msg.from === 'user' ? 'user-message' : 'bot-message'}
                            >
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="input-area">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Введите сообщение..."
                        />
                        <button onClick={sendMessage}>Отправить</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
