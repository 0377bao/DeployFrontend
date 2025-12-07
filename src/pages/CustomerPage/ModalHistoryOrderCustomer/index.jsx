import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalHistoryOrderCustomer.module.scss';
import { MyTable, Modal, Button } from '@/components';
import { fetchListHistoryOrderCustomer } from '@/services/customer.service';
import globalStyles from '@/components/GlobalStyle/GlobalStyle.module.scss';
import { formatDate } from '../../../utils/formatDate';
import ModalCreateApproveRelease from '../../ApproveReleasePage/ModalCreateApproveRelease';
import ModalHistoryOrderCustomerDetail from '../ModalHistoryOrderCustomerDetail';
import ModalOrderReleaseDetail from '../../../pages/ReleaseProductPage/ModalOrderReleaseDetail';

const cx = classNames.bind(styles);
const cxGlb = classNames.bind(globalStyles);

const ModalHistoryOrderCustomer = ({ isOpen, onClose, customerID }) => {
    const tableColumns = [
        {
            title: 'Mã giao dịch',
            dataIndex: 'orderReleaseID',
            key: 'orderReleaseID',
        },
        {
            title: 'Ngày giao dịch',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => <p className={cx('text')}>{formatDate(text)}</p>,
        },
        {
            title: 'Người tạo',
            dataIndex: 'employeeName',
            key: 'employeeName',
            render: (_, record) => <p className={cx('text')}>{record?.employees?.employeeName || ''}</p>,
        },
        {
            title: 'Tên khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (_, record) => <p className={cx('text')}>{record?.customers?.customerName || ''}</p>,
        },
        {
            title: 'Xem chi tiết',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <div className={cxGlb('action-table')}>
                    <Button success medium onClick={() => setSelectedHistory(record)}>
                        <span>Xem chi tiết</span>
                    </Button>
                </div>
            ),
        },
    ];

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [historyOrder, setHistoryOrder] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);

    const onChangePage = (page) => setPage(page);

    useEffect(() => {
        if (!customerID) return;
        // fetch data
        const fetchListHistoryOrder = async (customerID, page = 1) => {
            try {
                const res = await fetchListHistoryOrderCustomer(customerID, page);
                setHistoryOrder(res.data || []);
                setPage(res?.pagination?.currentPage || 1);
                setTotalPages(res?.pagination?.totalPages || 1);
            } catch (err) {
                console.log(err);
            }
        };
        fetchListHistoryOrder(customerID, page);
    }, [customerID, page]);

    return (
        <>
            <Modal isOpenInfo={isOpen} onClose={onClose}>
                <div className={cx('wrapper-order-history-customer')}>
                    <h2 className={cx('title-transaction')}>Lịch sử giao dịch</h2>
                    <MyTable
                        columns={tableColumns}
                        data={historyOrder}
                        pageSize={5}
                        pagination
                        currentPage={page}
                        total={totalPages * 5}
                        onChangePage={onChangePage}
                        className={'success'}
                    />
                </div>
            </Modal>
            <ModalOrderReleaseDetail
                isOpen={!!selectedHistory}
                onClose={() => setSelectedHistory(null)}
                orderReleaseItem={selectedHistory}
            />
            {/* <ModalHistoryOrderCustomerDetail
                initialData={selectedHistory}
                isOpen={!!selectedHistory}
                onClose={() => setSelectedHistory(null)}
            /> */}
        </>
    );
};

export default ModalHistoryOrderCustomer;
