import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';
import axios from 'axios';
import { useChatMapStore } from '../../store/chatMapStore';
import { Hospital } from '../../types/Hospital';

interface Message {
    from: 'user' | 'bot';
    text: string;
}

interface ChatBotProps {
    hospitals: Hospital[];
}

const ChatBot: React.FC<ChatBotProps> = ({ hospitals }) => {
    const [messages, setMessages] = useState<Message[]>([{
        from: 'bot', text: 'Привет! Я помощник HealthMap. Задай вопрос 🏥'
    }]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [pendingClinic, setPendingClinic] = useState<Hospital | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const setTargetClinic = useChatMapStore((state) => state.setTargetClinic);

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

        const lower = input.toLowerCase();

        // Проверка: упоминается ли существующая клиника
        const match = hospitals.find(h =>
            lower.includes(h.name.toLowerCase())
        );

        if (match) {
            setMessages([
                ...newMessages,
                {
                    from: 'bot',
                    text: `✅ Я нашёл клинику "${match.name}". Адрес: ${match.address}. Построить маршрут?`
                }
            ]);
            setPendingClinic(match);
            return;
        }

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

    const handleConfirmRoute = () => {
        if (!pendingClinic) return;
        setTargetClinic(pendingClinic.name);
        setMessages(prev => [...prev, { from: 'bot', text: '🚗 Прокладываю маршрут...' }]);
        setPendingClinic(null);
    };

    const handleDeclineRoute = () => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Хорошо, не будем строить маршрут 😊' }]);
        setPendingClinic(null);
    };

    return (
        <div className="chat-wrapper">
            <div className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>💬</div>

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

                    {pendingClinic && (
                        <div className="chat-buttons" style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '8px' }}>
                            <button style={{ flex: 1, padding: '8px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }} onClick={handleConfirmRoute}>Построить маршрут</button>
                            <button style={{ flex: 1, padding: '8px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px' }} onClick={handleDeclineRoute}>Нет, спасибо</button>
                        </div>
                    )}

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
