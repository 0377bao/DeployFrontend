import React from 'react';
import classNames from 'classnames/bind';
import styles from './ViewAccountProfile.module.scss';
import Button from '../Button';

const cx = classNames.bind(styles);

const ViewAccountProfile = ({data, onClick}) => {
    return (
        <div className={cx('wrapper-account-profile')}>
            <h1>Thông tin tài khoản</h1>
            <div className={cx('row')}>
                <p className={cx('label')}>Email</p>
                <p className={cx('title')}>{data.email}</p>
            </div>
            <div className={cx('row')}>
                <p className={cx('label')}>Mật khẩu</p>
                <p className={cx('title')}>*********</p>
            </div>
            <div className={cx('btn-action')}>
                <Button primary onClick={onClick}>
                    <span>Cập nhật mật khẩu</span>
                 </Button>
            </div>
            
        </div>
    );
}

export default ViewAccountProfile;
