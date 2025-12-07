import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ReceiveProductMissingPage.module.scss';
import { Button, ModelFilter, MyTable, PaginationUI } from '../../components';
import request, { post } from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';
import { formatStatusOrderPurchaseMissing, styleMessage } from '../../constants';
import ModalReceiveProductMissingDetail from '../../components/ModalReceiveProductMissingDetail';
import toast from 'react-hot-toast';
import { set } from 'lodash';

const cx = classNames.bind(styles);

const ReceiveProductMissingPage = () => {
    const pageSize = 5;
    const [page, setPage] = useState(1);
    const [receiverPurchaseList, setReceiverPurchaseList] = useState([]);
    const [showDetail, setShowDetail] = useState(false);
    const [indexDetail, setIndexDetail] = useState({});
    const [totalPage, setTotalPage] = useState(0);
    const [filterReceiverPurchase, setFilterReceiverPurchase] = useState({
        proposalID: '',
        createdAt: '',
        status: 'Đang xử lý',
        employeeName: '',
    });
    const columnsFilter = [
        {
            id: 1,
            label: 'Mã phiếu nhập',
            value: filterReceiverPurchase.proposalID,
            name: 'proposalID',
            setValue: (value) => setFilterReceiverPurchase((prev) => ({ ...prev, proposalID: value })),
        },
        {
            id: 2,
            label: 'Ngày lập',
            type: 'date',
            value: filterReceiverPurchase.createdAt,
            name: 'createdAt',
            setValue: (value) => setFilterReceiverPurchase((prev) => ({ ...prev, createdAt: value })),
        },
        {
            id: 3,
            label: 'Tên người tạo',
            value: filterReceiverPurchase.employeeName,
            name: 'employeeName',
            setValue: (value) => setFilterReceiverPurchase((prev) => ({ ...prev, employeeName: value })),
        },
    ];

    const selectFilter = [
        {
            id: 3,
            label: 'Trạng thái',
            value: filterReceiverPurchase.status,
            name: 'status',
            setValue: (value) => setFilterReceiverPurchase((prev) => ({ ...prev, status: value })),
            option: [
                {
                    name: 'Đang xử lý',
                    value: 'PENDING',
                },
                {
                    name: 'Đã giải quyết',
                    value: 'RESOLVED',
                },
                {
                    name: 'Đã hủy',
                    value: 'CANCELED',
                },
            ],
        },
    ];

    const columnsTable = [
        {
            title: 'Mã phiếu nhập thiếu',
            dataIndex: 'orderPurchaseMissingID',
            key: 'orderPurchaseMissingID',
        },
        {
            title: 'Ngày lập',
            dataIndex: 'createdAt',
            key: 'createAt',
            render: (text) => <p className={cx('text')}>{text.slice(0, 10)}</p>,
        },
        {
            title: 'Tên người tạo',
            dataIndex: 'employeeName',
            key: 'employeeName',
            render: (_, record) => <p className={cx('text')}>{record.orderPurchase.employee.employeeName}</p>,
        },
        {
            title: 'Mã kho',
            dataIndex: 'warehouseID',
            key: 'warehouseID',
            render: (_, record) => <p className={cx('text')}>{record.orderPurchase.warehouseID}</p>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (text) => <p className={cx('text')}>{formatStatusOrderPurchaseMissing[text]}</p>,
        },
        {
            title: 'Chi tiết',
            dataIndex: 'detail',
            key: 'detail',
            render: (text, record) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <Button
                        primary
                        medium
                        onClick={() => {
                            setIndexDetail(record);
                            setShowDetail(true);
                        }}
                    >
                        <span>Xem chi tiết</span>
                    </Button>
                </div>
            ),
        },
    ];

    const handleFilter = async ({ pageFilter = page, filter = filterReceiverPurchase }) => {
        try {
            const token = parseToken('tokenUser');
            const warehouse = parseToken('warehouse');
            const filterParam = {};
            if (filter.proposalID) filterParam.orderPurchaseMissingID = filter.proposalID;
            if (filter.createdAt) filterParam.createdAt = filter.createdAt;
            if (filter.status) filterParam.status = filter.status === 'Đang xử lý' ? 'PENDING' : filter.status;
            if (filter.employeeName) filterParam.employeeName = filter.employeeName;

            const params = { ...filterParam, warehouseID: warehouse.warehouseID, page: pageFilter };
            const res = await request.get(`/api/order-purchase-missing/filter`, {
                params,
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeid: token.employeeID,
                },
            });
            setReceiverPurchaseList(res.data.data || []);
            setTotalPage(res.data.pagination?.totalPages || 0);
        } catch (err) {
            console.log(err);
            toast.error(
                Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
                styleMessage,
            );
        }
    };

    const handleResetFilter = () => {
        setFilterReceiverPurchase({
            proposalID: '',
            createdAt: '',
            status: 'Đang xử lý',
            employeeName: '',
        });
        setPage(1);
        handleFilter({ pageFilter: 1, filter: { status: 'PENDING' } });
    };

    useEffect(() => {
        handleFilter({ pageFilter: page });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const onChangePage = (page) => {
        setPage(page);
    };

    return (
        <div className={cx('wrapper-approve')}>
            <ModelFilter
                className={cx('model-filter')}
                columns={columnsFilter}
                handleResetFilters={handleResetFilter}
                selectInput={selectFilter}
                handleSubmitFilter={() => {
                    setPage(1);
                    handleFilter({ pageFilter: 1 });
                }}
            />
            <div className={cx('table-container-header')}>
                <h1 className={cx('title-approve')}>Danh sách phiếu nhập thiếu</h1>
            </div>
            <div className={cx('table-container')}>
                <MyTable
                    currentPage={page}
                    //className={cx('my-table')}
                    columns={columnsTable}
                    data={receiverPurchaseList}
                    pageSize={pageSize}
                    pagination
                    total={totalPage * 5}
                    onChangePage={onChangePage}
                />
            </div>

            <ModalReceiveProductMissingDetail
                data={indexDetail}
                isOpen={showDetail}
                onClose={() => setShowDetail(false)}
                reset={handleFilter}
            />
        </div>
    );
};

export default ReceiveProductMissingPage;
