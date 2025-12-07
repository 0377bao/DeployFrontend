import React, { Fragment } from 'react';
import classNames from 'classnames/bind';
import styles from './NotifyItem.module.scss';
import { EllipsisVertical } from 'lucide-react';
import Image from '../../Image';
import WrapperTippy from '../../WrapperTippy';
import Popper from '../../Popper';
import { EyeOff, Paperclip } from 'lucide-react';
import Button from '../../Button';

const cx = classNames.bind(styles);

const NotifyItem = ({
    title = 'Hello',
    link = 'http://www.google.com',
    imageSrc = 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT90awoHrzBfmnOsQ4zV_vU1kJmgxJsjALKNdHf4NOXeh0GclY1Wwo1LRWYmwt5y8UUDyL5Cpt1CpIiqhCyxZFPVa9nXbnRZnL5fVuiug',
    time = '1 ngày trước',
}) => {
    const menuAction = [
        {
            title: 'Ẩn',
            onClick: () => {
                console.log('Ẩn');
            },
            Icon: EyeOff,
        },
        {
            title: 'Đánh dấu đã đọc thông báo',
            onClick: () => {
                console.log('Đã đọc');
            },
            Icon: Paperclip,
        }
    ];

    const renderAction = (attrs) => {
        return (
            <div ref={attrs.ref} className={cx('menu-action-list')} tabIndex="-1" {...attrs}>
                <Popper>
                    {menuAction &&
                        menuAction.length > 0 &&
                        menuAction.map((item, index) => {
                            let Comp = item.Icon
                            return <Button text className={cx('action-item')} key={index} leftIcon={<Comp size={18}/>} onClick={item.onClick}>{item.title}</Button>
                        })}
                </Popper>
            </div>
        );
    };
    return (
        <div className={cx('wrapper-notify-item')}>
            <Image classname={cx('image')} alt={'avatar'} src={imageSrc} />
            <div className={cx('notify-content')}>
                <p className={cx('notify-title')}>{title}</p>
                <p className={cx('notify-link')}>
                    Link file:{' '}
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        {link}
                    </a>
                </p>
                <p className={cx('time-receive')}>{time}</p>
            </div>
            <WrapperTippy placement='top-end' offset={[-10, 8]} renderTooltip={renderAction}>
                <div className={cx('option')}>
                    <EllipsisVertical size={18} />
                </div>
            </WrapperTippy>
        </div>
    );
};

export default NotifyItem;
