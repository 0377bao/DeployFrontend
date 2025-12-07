import React from 'react';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import Image from '../../Image';
import { useSelector } from 'react-redux';

const cx = classNames.bind(styles);

const Header = () => {
    const currentUser = useSelector(state => state.AuthSlice.user) 
   
    return (
        <div className={cx('wrapper-header-menu')}>
            <Image
                classname={cx('image')}
                alt={'avatar'}
                src={
                    'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT90awoHrzBfmnOsQ4zV_vU1kJmgxJsjALKNdHf4NOXeh0GclY1Wwo1LRWYmwt5y8UUDyL5Cpt1CpIiqhCyxZFPVa9nXbnRZnL5fVuiug'
                }
            />
            <div className={cx('header-content')}>
                <p className={cx('title')}>{currentUser.empName}</p>
                <p className={cx('user-id')}>ID: {currentUser.empId}</p>
            </div>
        </div>
    );
};

export default Header;
