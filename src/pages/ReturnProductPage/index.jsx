import React from 'react';
import classNames from 'classnames/bind';
import styles from './ReturnProductPage.module.scss'

const cx = classNames.bind(styles)

const ReturnProductPage = () => {
    return (
        <div className={cx('wrapper-return-order')}>
            <h1>Return Product</h1>
        </div>
    );
}

export default ReturnProductPage;