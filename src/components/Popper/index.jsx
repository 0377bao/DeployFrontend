import React from 'react';
import classNames from 'classnames/bind';
import styles from "./Popper.module.scss"

const cx = classNames.bind(styles)

const Popper = ({children, classname, ...pass}) => {
    return (
        <div className={cx('wrapper', classname)} {...pass}>
            {children}
        </div>
    );
}

export default Popper;
