import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import classNames from 'classnames/bind';
import styles from './Icon.module.scss'

const cx = classNames.bind(styles)

const Icon = ({classname, name, size}) => {
    return (
        <FontAwesomeIcon className={cx('wrapper-icon', {
            [size]: true,
            [classname]: true
        })} icon={name}/>
    );
}

export default Icon;
