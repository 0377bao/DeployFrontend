import React, { Fragment } from 'react';
import {Link} from "react-router-dom"
import classNames from 'classnames/bind';
import styles from './MenuItem.module.scss'
import {Button} from "@/components"

const cx = classNames.bind(styles)

const MenuItem = ({title, Icon, to, onClick}) => {
    
    return (
        <Button className={cx('wrapper-menu-item')} to={to} onClick={onClick} leftIcon={Icon && <Icon className={cx('icon')} size={18}/>}>
            <span className={cx('title')}>{title}</span>
        </Button>
    );
}

export default MenuItem;
