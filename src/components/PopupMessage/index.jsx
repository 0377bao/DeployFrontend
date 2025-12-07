import React from 'react';
import classNames from 'classnames/bind';
import styles from "./PopupMessage.module.scss"

const cx = classNames.bind(styles)

const PopupMessage = ({children}) => {
    return (
        <div className={cx('wrapper-popup-message')}>
            <div className={cx('content')}>
                {children}
            </div>
        </div>
    );
}

export default PopupMessage;
