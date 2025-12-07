import React from 'react';
import classNames from 'classnames/bind';
import styles from './Loading.module.scss';
import { Spin } from "antd";

const cx = classNames.bind(styles);

const Loading = () => {
    return (
         <div className={cx('overlay-loading')}>
                    <Spin size="large" />
                </div>
    );
}

export default Loading;