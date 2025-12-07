import React from 'react';
import classNames from 'classnames/bind';
import styles from './InfoWare.module.scss';

const cx = classNames.bind(styles);

export default function InfoWare({ warehouseId, warehouseName, faxNumber, address, status }) {
    return (
        <div className={cx('info-ware')}>
            <h2 className={cx('title')}>THÔNG TIN KHO</h2>
            <ul className={cx('list')}>
                <li className={cx('item')}>
                    <span className={cx('label')}>Mã kho:</span>
                    <span className={cx('value')}>{warehouseId}</span>
                </li>
                <li className={cx('item')}>
                    <span className={cx('label')}>Tên kho:</span>
                    <span className={cx('value')}>{warehouseName}</span>
                </li>
                <li className={cx('item')}>
                    <span className={cx('label')}>SDT:</span>
                    <span className={cx('value')}>{faxNumber}</span>
                </li>
                <li className={cx('item')}>
                    <span className={cx('label')}>Địa chỉ:</span>
                    <span className={cx('value')}>{address}</span>
                </li>
                <li className={cx('item')}>
                    <span className={cx('label')}>Trạng thái:</span>
                    <span className={cx('value')}>
                        <span
                            className={cx('status-dot', {
                                active: status === 'ACTIVE',
                                inactive: status === 'INACTIVE',
                            })}
                        ></span>
                        {status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </span>
                </li>
            </ul>
        </div>
    );
}
