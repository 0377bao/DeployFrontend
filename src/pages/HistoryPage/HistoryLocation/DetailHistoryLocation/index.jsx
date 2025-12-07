/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import classNames from 'classnames/bind';
import styles from './DetailHistoryLocation.module.scss';
import { Button, MyTable } from '@/components';
import Modal from '@/components/Modal';
const cx = classNames.bind(styles);

const DetailHistoryLocation = ({ isOpen, onClose, data }) => {
    const columnsDefineSuggestProposal = [
        {
            title: 'Vị trí',
            dataIndex: 'location',
            key: 'location',
            width: '200px',
            render: (_, record) => {
                const location = `${record.toBox.boxName} - ${record.toBox.floor.floorName} - ${record.toBox.floor.shelf.shelfName}`;
                return <span>{location}</span>;
            },
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right',
            width: '80px',
            render: (_, record) => <p>{record?.quantity}</p>,
        },
    ];

    console.log('data ', data);

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('wrapper')}>
                <div className={cx('table-header')}>
                    <p className={cx('table-title')}>Danh sách các ô chứa</p>
                </div>

                <MyTable data={data} columns={columnsDefineSuggestProposal} />
            </div>
        </Modal>
    );
};

export default DetailHistoryLocation;
