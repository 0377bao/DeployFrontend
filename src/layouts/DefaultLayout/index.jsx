import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './DefaultLayout.module.scss';
import { Sidebar } from '../components';
import Header from '../components/Header';
import PageLayout from '../PageLayout';
import { Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatBox } from '@/components';
import { Spin } from 'antd';
import { useSelector } from 'react-redux';

const cx = classNames.bind(styles);

const DefaultLayout = ({ children }) => {
    const [showChatBox, setShowChatBox] = useState(false);
    const { statusLoading } = useSelector((state) => state.LoadingSlice);
    const [sliceChatBox, setSliceChatBox] = useState(false);

    return (
        <div className={cx('wrapper-layout')}>
            <Header />
            <Sidebar />
            <div className={cx('container-content')}>
                <PageLayout>{children}</PageLayout>
            </div>

            <ChatBox classnames={'show'} isOpen={showChatBox} closed={() => setShowChatBox((prev) => !prev)} />

            <div
                className={cx('group-btn-chat-box')}
                style={{
                    transform: `${sliceChatBox ? 'translateX(0%)' : 'translateX(90%)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s linear',
                    backgroundColor: `${sliceChatBox ? 'transparent' : '#e7e7e7'}`,
                }}
            >
                <ChevronLeft
                    size={30}
                    className={cx(sliceChatBox ? ['arrow', 'open'] : 'arrow')}
                    onClick={() => setSliceChatBox((prev) => !prev)}
                />
                <button className={cx('btn-show-chat-box')} onClick={() => setShowChatBox((prev) => !prev)}>
                    <Bot size={30} color={'white'} />
                    <p className={cx('title-chat-box')}>Trợ lý</p>
                </button>
            </div>

            {statusLoading && (
                <div className={cx('overlay-loading')}>
                    <Spin size="large" />
                </div>
            )}
        </div>
    );
};

export default DefaultLayout;
