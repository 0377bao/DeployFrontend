import React from 'react';
import classNames from 'classnames/bind';
import styles from './PageLayout.module.scss'

const cx = classNames.bind(styles)

const PageLayout = ({children}) => {
    return (
        <div className={cx('wrapper-container-content')}>
            {children}
        </div>
    );
}

export default PageLayout;
