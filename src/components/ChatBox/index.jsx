import React, { useState, useRef, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ChatBox.module.scss';
import { X as XClosed } from 'lucide-react';
import { Input } from '@/components';
import Button from '../Button';
import { chatWithBot, initChatBox } from '../../services/aiService.service';
import logo from '@/assets/boxheroAI.png';
import parseToken from '../../utils/parseToken';
import { handleAction } from './handleAction';

const cx = classNames.bind(styles);

const ChatBox = ({ classnames, isOpen, closed }) => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const contentRef = useRef(null);
    const [focusInput, setFocusInput] = useState(false);

    useEffect(() => {
        setFocusInput(isOpen);
    }, [isOpen]);

    useEffect(() => {
        // function to intial user for dialog flow
        const initUser = async () => {
            const res = await initChatBox();
            if (res.data.status === 'OK') {
                setSessionId(res.data.sessionId);
            }
        };

        initUser();
    }, []);

    const handleSubmitInput = async (value) => {
        if (!value) return;
        // Push user message
        setMessages((prev) => [...prev, { from: 'user', type: 'text', text: value }]);

        // Mock backend response
        const res = await chatWithBot({ message: value, sessionId });
        if (res.data.status === 'OK') {
            setMessages((prev) => [...prev, ...res.data.data]);
        }
    };

    const handleCheckboxChange = (optionValue, checked) => {
        // Push message hoặc xử lý backend theo checkbox
        console.log('Checkbox:', optionValue, 'Checked:', checked);
    };

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div
            className={cx('chat-box', {
                show: isOpen,
                [classnames]: isOpen,
            })}
        >
            <div className={cx('header-chat-box')}>
                <img src={logo} className={cx('logo-sidebar')} loading="lazy" />
                <button className={cx('btn-close-chat')} onClick={closed}>
                    <XClosed size={20} />
                </button>
            </div>

            <div className={cx('content-chat-box')} ref={contentRef}>
                {messages.map((m, index) => (
                    <div key={index} className={cx('message', m.from)}>
                        {m.type === 'text' && <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>}
                        {m.type === 'buttons' && (
                            <div className={cx('button-group')}>
                                {m.buttons.map((btn, i) => (
                                    <Button
                                        key={i}
                                        onClick={() => handleSubmitInput(btn.value)}
                                        style={{ marginRight: 5 }}
                                    >
                                        {btn.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                        {m.type === 'actions' && (
                            <div className={cx('action-group')}>
                                {m.actions.map((btn, i) => (
                                    <Button key={i} onClick={() => handleAction(btn.payload, navigate)}>
                                        {btn.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                        {m.type === 'checkbox' && (
                            <div className={cx('checkbox-group')}>
                                {m.options.map((opt, i) => (
                                    <label key={i} style={{ display: 'block' }}>
                                        <input
                                            type="checkbox"
                                            onChange={(e) => handleCheckboxChange(opt.value, e.target.checked)}
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className={cx('wrapper-input')}>
                <Input focusInput={focusInput} borderRadius={18} onSubmit={handleSubmitInput} />
            </div>
        </div>
    );
};

export default React.memo(ChatBox);
