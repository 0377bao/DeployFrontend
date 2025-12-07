import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ProductHistory.module.scss';
import Modal from '../Modal';
import { MyTable } from '@/components';
import { getLogByProductID } from '../../services/productquantitylog.service';
import { typeTransaction } from '../../constants';
import { convertDateVN } from '../../common';

const cx = classNames.bind(styles);

const ProductHistory = ({ data, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fecthData = async () => {
            const res = await getLogByProductID({ productID: data, page: currentPage });

            if (res.data?.status === 'OK') {
                setLogs(res.data.data);
                setTotalPages(res.data.pagination.totalPages);
            }
        };
        fecthData();
    }, [currentPage]);

    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (_, __, index) => index + 1,
            width: 60,
            align: 'center',
        },
        {
            title: 'Loại giao dịch',
            dataIndex: 'actionType',
            key: 'actionType',
            render: (text) => typeTransaction[text],
        },
        {
            title: 'Số lượng trước',
            dataIndex: 'previousAmount',
            key: 'previousAmount',
            align: 'right',
        },
        {
            title: 'Số lượng sau',
            dataIndex: 'newAmount',
            key: 'newAmount',
            align: 'right',
        },
        {
            title: 'Số lượng thay đổi',
            dataIndex: 'quantityChange',
            key: 'quantityChange',
            align: 'right',
        },
        {
            title: 'Mã giao dịch',
            dataIndex: 'referenceID',
            key: 'referenceID',
        },
        {
            title: 'Ngày giao dịch',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => convertDateVN(text),
        },
        {
            title: 'Người tạo giao dịch',
            dataIndex: 'employeeName',
            key: 'employeeName',
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
        },
    ];

    return (
        <Modal showButtonClose={false} isOpenInfo={true} onClose={onClose}>
            <div className={cx('wrapper')}>
                <div className={cx('header')}>
                    <h2>Lịch sử thay đổi số lượng sản phẩm</h2>
                </div>
                <MyTable
                    columns={columns}
                    data={logs}
                    pagination
                    pageSize={5}
                    currentPage={currentPage}
                    onChangePage={(page) => setCurrentPage(page)}
                    total={totalPages * 5}
                    rowKey={(record, index) => index}
                    className={'success'}
                />
            </div>
        </Modal>
    );
};

export default ProductHistory;
