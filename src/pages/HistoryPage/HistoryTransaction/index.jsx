import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { MyTable } from '@/components';
import styles from './HistoryTransaction.module.scss';
import ModelFilter from '@/components/ModelFilter';
import { filterProductQuantityLog } from '@/services/productquantitylog.service';
import { typeTransaction } from '@/constants';
import { convertDateVN } from '@/common';

const cx = classNames.bind(styles);

const HistoryTransaction = () => {
    const [page, setPage] = useState(1);
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [typeTransactionFilter, setTypeTransactionFilter] = useState('ALL');
    const [employeeCreateFilter, setEmployeeCreateFilter] = useState('');
    const [productFilter, setProductFilter] = useState('');
    const [listHistory, setListHistory] = useState([]);
    const [totalPage, setTotalPage] = useState(0);

    const columns = [
        {
            title: 'Loại giao dịch',
            dataIndex: 'transactionType',
            key: 'transactionType',
            width: '10%',
            ellipsis: true,
            render: (_, record) => {
                return <span>{typeTransaction[record.actionType]}</span>;
            },
        },
        {
            title: 'Mã SP',
            dataIndex: 'productCode',
            width: '7%',
            key: 'productCode',
            ellipsis: true,
            render: (_, record) => {
                return <span>{record.product.productID}</span>;
            },
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            ellipsis: true,
            render: (_, record) => {
                return <span>{record.product.productName}</span>;
            },
        },
        {
            title: 'Số lượng trước',
            dataIndex: 'previousAmount',
            key: 'previousAmount',
            width: '10%',
            ellipsis: true,
            align: 'right',
        },
        {
            title: 'Số lượng sau',
            dataIndex: 'newAmount',
            key: 'newAmount',
            width: '10%',
            ellipsis: true,
            align: 'right',
        },
        {
            title: 'Số lượng thay đổi',
            dataIndex: 'quantityChange',
            key: 'quantityChange',
            width: '10%',
            ellipsis: true,
            align: 'right',
        },
        {
            title: 'Mã giao dịch',
            dataIndex: 'referenceID',
            key: 'referenceID',
            width: '10%',
            ellipsis: true,
        },
        {
            title: 'Ngày giao dịch',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '15%',
            ellipsis: true,
            render: (_, record) => {
                return <span>{convertDateVN(record.createdAt)}</span>;
            },
        },
        {
            title: 'Người tạo',
            dataIndex: 'employeeCreate',
            key: 'employeeCreate',
            width: '12%',
            ellipsis: true,
            render: (index, record) => {
                console.log(record);
                let employee = null;
                let employeeID = null;
                if (record.orderPurchase) {
                    employee = record.orderPurchase.employee;
                    employeeID = record.orderPurchase.employeeID;
                } else if (record.orderRelease) {
                    employee = record.orderRelease.employees;
                    employeeID = record.orderRelease.employeeID;
                } else if (record.inventoryCheck) {
                    employee = record.inventoryCheck.employee;
                    employeeID = record.inventoryCheck.employeeID;
                }
                return (
                    <span title={`${employee?.employeeName} - ${employeeID}`}>
                        {employee?.employeeName} - {employeeID}
                    </span>
                );
            },
        },
    ];

    const onChangePage = (page) => {
        setPage(page);
    };

    const handleSubmitFilter = () => {
        setPage(1);
        fetchData({
            startDateFilter,
            endDateFilter,
            typeTransactionFilter,
            employeeCreateFilter,
            productFilter,
            page: 1,
        });
    };

    const columnsFilter = [
        {
            id: 'startDate',
            label: 'Từ ngày',
            value: startDateFilter,
            setValue: setStartDateFilter,
            type: 'date',
        },
        {
            id: 'endDate',
            label: 'Đến ngày',
            value: endDateFilter,
            setValue: setEndDateFilter,
            type: 'date',
        },
        {
            id: 'employeeCreate',
            label: 'Mã người tạo giao dịch',
            value: employeeCreateFilter,
            setValue: setEmployeeCreateFilter,
        },
        {
            id: 'product',
            label: 'Mã sản phẩm',
            value: productFilter,
            setValue: setProductFilter,
        },
    ];

    const selectInput = [
        {
            label: 'Loại giao dịch',
            value: typeTransactionFilter,
            option: [
                {
                    name: 'Tất cả',
                    value: 'ALL',
                },
                {
                    name: 'Nhập hàng',
                    value: 'PURCHASE',
                },
                {
                    name: 'Xuất hàng',
                    value: 'RELEASE',
                },
                {
                    name: 'Kiểm kê',
                    value: 'INVENTORY_CHECK',
                },
            ],
            setValue: (value) => setTypeTransactionFilter(value),
        },
    ];

    const fetchData = async ({
        startDateFilter,
        endDateFilter,
        typeTransactionFilter,
        employeeCreateFilter,
        productFilter,
        page,
    }) => {
        // Fetch data logic here
        const res = await filterProductQuantityLog({
            dateFrom: startDateFilter,
            dateTo: endDateFilter,
            actionType: typeTransactionFilter == 'ALL' ? '' : typeTransactionFilter,
            employeeCreate: employeeCreateFilter,
            productID: productFilter,
            page: page,
        });

        if (res.data?.status === 'OK') {
            console.log('data ', res.data?.data);

            setListHistory(res.data?.data || []);
            setTotalPage(res.data?.pagination?.totalPages || 0);
        }
    };

    useEffect(() => {
        fetchData({ page, startDateFilter, endDateFilter, typeTransactionFilter, employeeCreateFilter, productFilter });
    }, [page]);

    return (
        <div className={cx('wrapper-report')}>
            <div className={cx('header')}>
                <ModelFilter
                    className={cx('header-filter')}
                    handleSubmitFilter={handleSubmitFilter}
                    handleResetFilters={() => {
                        setStartDateFilter('');
                        setEndDateFilter('');
                        setTypeTransactionFilter('ALL');
                        setEmployeeCreateFilter('');
                        setProductFilter('');
                        setPage(1);
                        fetchData({ page: 1 });
                    }}
                    selectInput={selectInput}
                    columns={columnsFilter}
                />
            </div>
            <div className={cx('content')}>
                <MyTable
                    currentPage={page}
                    columns={columns}
                    data={listHistory}
                    pagination
                    total={totalPage * 5}
                    pageSize={5}
                    onChangePage={onChangePage}
                />
            </div>
        </div>
    );
};

export default HistoryTransaction;
