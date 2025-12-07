import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { MyTable } from '@/components';
import styles from './HistoryLocation.module.scss';
import ModelFilter from '@/components/ModelFilter';
import { convertDateVN } from '@/common';
import { filter } from '@/services/batchmovelog.service';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import { Eye } from 'lucide-react';
import Tippy from '@tippyjs/react';
import DetailHistoryLocation from './DetailHistoryLocation';
const cxGlobal = classNames.bind(globalStyle);

const cx = classNames.bind(styles);

const HistoryLocation = () => {
    const [page, setPage] = useState(1);
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [typeTransactionFilter, setTypeTransactionFilter] = useState('ALL');
    const [employeeCreateFilter, setEmployeeCreateFilter] = useState('');
    const [batchFilter, setBatchFilter] = useState('');
    const [listHistory, setListHistory] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const [dataDetail, setDataDetail] = useState(null);

    const columns = [
        {
            title: 'Mã Lô',
            dataIndex: 'batchID',
            width: '7%',
            key: 'batchID',
            ellipsis: true,
        },
        {
            title: 'Mã SP',
            dataIndex: 'productCode',
            width: '7%',
            key: 'productCode',
            ellipsis: true,
            render: (_, record) => {
                return <span>{record.batch.product.productID}</span>;
            },
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            ellipsis: true,
            render: (_, record) => {
                return <span>{record.batch.product.productName}</span>;
            },
        },
        {
            title: 'Vị trí chuyển',
            dataIndex: 'fromLocation',
            key: 'fromLocation',
            ellipsis: true,
            width: '15%',
            render: (_, record) => {
                let location = '';
                if (record.actionType === 'FROM_TEMP') {
                    location = 'Kho tạm';
                } else {
                    location = `${record.fromBox.boxName} - ${record.fromBox.floor.floorName} - ${record.fromBox.floor.shelf.shelfName}`;
                }
                return <span>{location}</span>;
            },
        },
        {
            title: 'Số lượng chuyển',
            dataIndex: 'quantity',
            key: 'quantity',
            ellipsis: true,
            align: 'right',
            width: '10%',
            render: (_, record) => {
                return <span>{record.quantity}</span>;
            },
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
            width: '10%',
            ellipsis: true,
            render: (index, record) => {
                return <span>{record.creator?.employeeName}</span>;
            },
        },
        {
            title: 'Thao tác',
            dataIndex: 'action',
            key: 'action',
            width: '7%',
            render: (_, record) => {
                return (
                    <div className={cxGlobal('action-table')}>
                        <Tippy content={'Xem vị trí chuyển đến'} placement="bottom-end">
                            <button
                                className={cxGlobal('action-table-icon')}
                                onClick={() => setDataDetail(record.details)}
                            >
                                <Eye size={20} />
                            </button>
                        </Tippy>
                    </div>
                );
            },
        },
    ];

    const onChangePage = (page) => {
        setPage(page);
    };

    const handleSubmitFilter = () => {
        fetchData({
            startDateFilter,
            endDateFilter,
            typeTransactionFilter,
            employeeCreateFilter,
            batchFilter,
            page,
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
            label: 'Người tạo giao dịch',
            value: employeeCreateFilter,
            setValue: setEmployeeCreateFilter,
        },
        {
            id: 'batchID',
            label: 'Mã lô',
            value: batchFilter,
            setValue: setBatchFilter,
        },
    ];

    const selectInput = [
        {
            label: 'Nơi chuyển',
            value: typeTransactionFilter,
            option: [
                {
                    name: 'Tất cả',
                    value: 'ALL',
                },
                {
                    name: 'Từ kho tạm',
                    value: 'FROM_TEMP',
                },
                {
                    name: 'Từ ô chứa',
                    value: 'FROM_BOX',
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
        batchFilter,
        page,
    }) => {
        // Fetch data logic here
        const res = await filter({
            dateFrom: startDateFilter,
            dateTo: endDateFilter,
            actionType: typeTransactionFilter == 'ALL' ? '' : typeTransactionFilter,
            employeeCreate: employeeCreateFilter,
            batchID: batchFilter,
            page: page,
        });

        if (res.data?.status === 'OK') {
            console.log('data ', res.data?.data);

            setListHistory(res.data?.data || []);
            setTotalPage(res.data?.pagination?.totalPages || 0);
            console.log(res.data?.pagination?.totalPages);
        }
    };

    useEffect(() => {
        // Fetch initial data if needed
        fetchData({ page });
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        setBatchFilter('');
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
            {dataDetail && (
                <DetailHistoryLocation isOpen={dataDetail} onClose={() => setDataDetail(null)} data={dataDetail} />
            )}
        </div>
    );
};

export default HistoryLocation;
