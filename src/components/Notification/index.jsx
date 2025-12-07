import React from 'react';
import classNames from 'classnames/bind';
import styles from './Notification.module.scss';
import WrapperTippy from '../WrapperTippy';
import Popper from '../Popper';
import NotifyItem from './NotifyItem';

const cx = classNames.bind(styles);

const Notification = ({ children, notifyItems = [1,2,3,4,1,1,1,1,1,10,1,1,1,1,1] }) => {
    const renderNotify = (attrs) => {
        return (<div ref={attrs.ref} className={cx('notify-list')} tabIndex="-1" {...attrs}>
            <Popper>
                {notifyItems.length > 0 && notifyItems.map((item, index) => <NotifyItem key={index} data={item} />)}
            </Popper>
        </div>)
    };
    return <WrapperTippy renderTooltip={renderNotify}>{children}</WrapperTippy>;
};

export default Notification;
