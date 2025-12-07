import React from 'react';
import classNames from 'classnames/bind';
import styles from './ZonePage.module.scss';

const cx = classNames.bind(styles);

const ZonePage = () => {
    return (
        <div className={cx('wrapper-zone')}>
            <h1>Quản lý khu vực</h1>
        </div>
    );
}

export default ZonePage;