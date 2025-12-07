import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalOrderReleaseDetailBatchProduct.module.scss';

import { Modal, MyTable } from '../../../components';

const cx = classNames.bind(styles);

const ModalOrderReleaseDetailBatchProduct = ({ item, isOpen, onClose }) => {
    const [batchList, setBatchList] = useState([]);
    const tableColumns = [
        {
            title: 'Mã lô',
            dataIndex: 'batchID',
            key: 'batchID',
        },
        {
            title: 'Ngày sản xuất',
            dataIndex: 'manufactureDate',
            key: 'manufactureDate',
            render: (text) => <p>{text.split('T')[0]}</p>,
        },
        {
            title: 'Ngày hết hạn',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            render: (text) => <p>{text.split('T')[0]}</p>,
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'unitName',
            key: 'unitName',
        },
        {
            title: 'Số lượng xuất',
            dataIndex: 'quantityExported',
            key: 'quantityExported',
            render: (text) => <p className={cx('cell-number')}>{text}</p>,
        },
        {
            title: 'Quy đổi',
            dataIndex: 'conversion',
            key: 'conversion',
            render: (text) => <p className={cx('cell-number')}>{text}</p>,
        },
    ];

    useEffect(() => {
        if (!item) return;
        const formatBatchList = item.batchOfProductExported.map((info) => {
            console.log('info', info);
            const uom = info.batch.unit.conversionQuantity;
            return {
                batchID: info.batch.batchID,
                manufactureDate: info.batch.manufactureDate,
                expiryDate: info.batch.expiryDate,
                unitName: info.batch.unit.unitName,
                quantityExported: info.quantityExported,
                conversion: Number(info.quantityExported) * Number(uom),
            };
        });
        setBatchList(formatBatchList);
    }, [item]);

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose}>
            <div className={cx('order-release-batch-product-detail')}>
                <p className={cx('title')}>Danh sách lô hàng xuất của sản phẩm</p>
                <MyTable columns={tableColumns} data={batchList} scroll={{ y: 300 }} />
            </div>
        </Modal>
    );
};

export default ModalOrderReleaseDetailBatchProduct;
