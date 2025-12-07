import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalBatchBoxProductDetail.module.scss';
import { useSelector } from 'react-redux';
import { MyTable, Modal } from '../../../components';

const cx = classNames.bind(styles);

const ModalBatchBoxProductDetail = ({ isOpen, onClose, batchID, productID }) => {
    const batchBoxListStore = useSelector((state) => state.BatchProductSlice.batchBoxProductList);
    const [batchBoxList, setBatchBoxList] = useState([]);

    useEffect(() => {
        if (!batchID || !productID || !batchBoxListStore) return;
        const key = `${productID}-${batchID}`;
        const existRow = batchBoxListStore[key];
        console.log('existRow', existRow);
        if (!existRow) return;
        setBatchBoxList(existRow);
    }, []);

    const tableColumns = [
        {
            title: 'Mã ô',
            dataIndex: 'boxID',
            key: 'boxID',
            width: '15%',
            render: (text) => <span className={cx('cell-text', 'box-id')}>{text}</span>,
        },
        {
            title: 'Tên ô',
            dataIndex: 'boxName',
            key: 'boxName',
            width: '30%',
            render: (text) => <span className={cx('cell-left')}>{text}</span>,
        },
        {
            title: 'Tầng',
            dataIndex: 'boxFloor',
            key: 'boxFloor',
            width: '12%',
            render: (text) => <span className={cx('cell-center')}>{text}</span>,
        },
        {
            title: 'Số lượng hiện có', // ← Hiển thị số lượng hiện có
            dataIndex: 'amountAvailable',
            key: 'amountAvailable',
            width: '15%',
            render: (text) => (
                <span className={cx('cell-center', 'amount-available')}>{text ? text.toLocaleString() : 0}</span>
            ),
        },
        {
            title: 'Số lượng lấy', // ← Input để nhập số lượng lấy
            dataIndex: 'quantityExported',
            key: 'quantityExported',
            width: '15%',
            render: (text) => <p className={cx('cell-number')}>{text}</p>,
        },
    ];

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose}>
            <div className={cx('wrapper-batch-box-dialog')}>
                <div className={cx('dialog-header')}>
                    <div className={cx('dialog-header-top')}>
                        <h3 className={cx('header-title')}>Danh sách vị trí ô chứa lô: {batchID || 'N/A'}</h3>
                    </div>
                </div>
                <MyTable data={batchBoxList} columns={tableColumns} />
            </div>
        </Modal>
    );
};

export default ModalBatchBoxProductDetail;
