/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ImportProduct.module.scss';
import { formatStatusOrderPurchase, formatTypeOrderPurchase } from '../../../constants';
import { Button, ModelFilter, MyTable, PaginationUI } from '../../../components';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import { Circle, Download, Plus } from 'lucide-react';
import ModelProposalDetail from '../../ApprovePage/ModelProposalDetail';
import { fetchOrderPurchase, filterOrderPurchase } from '../../../services/order.service';
import OrderPurchaseDetail from '../OrderPurchaseDetail';
import ModelCreateOrderPurchase from '../ModelCreateOrderPurchase';
import { authIsAdmin } from '../../../common';
import { useSelector } from 'react-redux';

const cxGlobal = classNames.bind(globalStyle);
const cx = classNames.bind(styles);

const ImportProduct = () => {
    const [orderPurchaseList, setOrderPurchaseList] = useState([]);
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [orderPurchaseDetail, setOrderPurchaseDetail] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCreateOrderPurchase, setShowCreateOrderPurchase] = useState(false);
    const [totalPage, setTotalPage] = useState(0);
    const employee = useSelector((state) => state.AuthSlice.user);

    const [filter, setFilter] = useState({
        code: '',
        createdAt: '',
        employeeName: '',
        type: 'ALL',
        originalOrderPurchaseID: '',
        proposalID: '',
    });

    const columnsDefineSuggestProposal = [
        {
            title: 'Mã phiếu nhập',
            dataIndex: 'orderPurchaseID',
            key: 'orderPurchaseID',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (_, record) => <p className={cx('text')}>{record?.createdAt?.slice(0, 10)}</p>,
        },
        {
            title: 'Nhân viên lập phiếu',
            dataIndex: 'employeeIDCreate',
            key: 'employeeIDCreate',
            render: (_, record) => {
                return <p className={cx('text')}>{record?.employee?.employeeName}</p>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (index, record) => {
                return (
                    <div className={cx('status-proposal')}>
                        <p className={cx('text')}>{formatStatusOrderPurchase[record.status]}</p>
                    </div>
                );
            },
        },
        {
            title: 'Loại phiếu',
            dataIndex: 'type',
            key: 'type',
            render: (index, record) => {
                return <p className={cx('text')}>{formatTypeOrderPurchase[record.type]}</p>;
            },
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                return (
                    <div className={cxGlobal('action-table')}>
                        <Button
                            primary
                            medium
                            onClick={() => {
                                setOrderPurchaseDetail(record);
                            }}
                        >
                            <span>Xem chi tiết</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

    const fetchData = async () => {
        const res = await fetchOrderPurchase(currentPage);

        if (res.data?.status === 'OK') {
            setOrderPurchaseList(res.data.data || []);
            setTotalPage(res.data?.pagination?.totalPages || 0);
        }
    };

    const onChangePage = (page) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Fetch initial data if needed
        handleSubmitFilter({ page: currentPage });
    }, [currentPage]);

    const columnsFilter = [
        {
            id: 1,
            label: 'Mã phiếu nhập',
            dataIndex: 'orderPurchaseID',
            key: 'orderPurchaseID',
            setValue: (value) => setFilter({ ...filter, code: value }),
            value: filter.code,
        },
        {
            id: 2,
            label: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            type: 'date',
            setValue: (value) => setFilter({ ...filter, createdAt: value }),
            value: filter.createdAt,
        },
        {
            id: 3,
            label: 'Tên nhân viên lập phiếu',
            dataIndex: 'employeeName',
            key: 'employeeName',
            setValue: (value) => setFilter({ ...filter, employeeName: value }),
            value: filter.employeeName,
        },
    ];

    const columnsFilterMissing = [
        {
            id: 4,
            label: 'Mã phiếu nhập gốc',
            dataIndex: 'originalOrderPurchaseID',
            key: 'originalOrderPurchaseID',
            setValue: (value) => setFilter({ ...filter, originalOrderPurchaseID: value }),
            value: filter.originalOrderPurchaseID,
        },
    ];

    const columnsFilterProposal = [
        {
            id: 4,
            label: 'Mã phiếu đề xuất',
            dataIndex: 'proposalID',
            key: 'proposalID',
            setValue: (value) => setFilter({ ...filter, proposalID: value }),
            value: filter.proposalID,
        },
    ];

    const handleChangeTypeFilter = (value) => {
        setTypeFilter(value);
        setFilter({ ...filter, type: value });
    };

    const selectInput = [
        {
            label: 'Loại phiếu',
            value: filter.type,
            option: [
                {
                    name: 'Tất cả',
                    value: 'ALL',
                },
                {
                    name: 'Phiếu nhập mới',
                    value: 'NORMAL',
                },
                {
                    name: 'Phiếu bổ sung',
                    value: 'SUPPLEMENT',
                },
            ],
            setValue: (value) => handleChangeTypeFilter(value),
        },
    ];

    const handleSubmitFilter = async ({ page }) => {
        if (Object.keys(filter).every((key) => filter[key] == '')) return;
        const filterParams = { ...filter };
        if (filter.type === 'ALL') {
            delete filterParams.type;
        } else if (filter.type === 'NORMAL') {
            delete filterParams.originalOrderPurchaseID;
        } else if (filter.type === 'SUPPLEMENT') {
            delete filterParams.proposalID;
        }
        const res = await filterOrderPurchase({ ...filterParams, page });
        if (res.data?.status === 'OK') {
            setOrderPurchaseList(res.data.data || []);
            setTotalPage(res.data?.pagination?.totalPages || 0);
        }
    };

    const handleResetFilter = () => {
        setFilter({
            code: '',
            createdAt: '',
            employeeName: '',
            type: 'ALL',
            originalOrderPurchaseID: '',
            proposalID: '',
        });
        fetchData();
        setTypeFilter('ALL');
        setCurrentPage(1);
    };

    return (
        <div className={cx('wrapper-import-product')}>
            <ModelFilter
                className={cx('header-filter')}
                columns={
                    typeFilter == 'ALL'
                        ? columnsFilter
                        : typeFilter === 'SUPPLEMENT'
                        ? [...columnsFilter, ...columnsFilterMissing]
                        : [...columnsFilter, ...columnsFilterProposal]
                }
                selectInput={selectInput}
                handleSubmitFilter={() => {
                    handleSubmitFilter({ page: 1 });
                    setCurrentPage(1);
                }}
                handleResetFilters={handleResetFilter}
            >
                {authIsAdmin(employee) ? (
                    <Button
                        primary
                        onClick={() => {
                            setShowCreateOrderPurchase(true);
                        }}
                        leftIcon={<Plus size={16} />}
                    >
                        <span>Tạo phiếu nhập</span>
                    </Button>
                ) : (
                    <></>
                )}
            </ModelFilter>

            <div className={cx('view-list-proposal')}>
                <div className={cx('table-header')}>
                    <p className={cx('table-title')}>Danh sách phiếu nhập</p>
                </div>

                <MyTable
                    data={orderPurchaseList}
                    columns={columnsDefineSuggestProposal}
                    pagination
                    total={totalPage * 5}
                    pageSize={5}
                    onChangePage={onChangePage}
                    currentPage={currentPage}
                />
            </div>
            {orderPurchaseDetail && (
                <OrderPurchaseDetail
                    orderPurchaseDetail={orderPurchaseDetail}
                    isOpen={orderPurchaseDetail != null}
                    onClose={() => setOrderPurchaseDetail(null)}
                />
            )}
            {showCreateOrderPurchase && (
                <ModelCreateOrderPurchase
                    isOpen={showCreateOrderPurchase}
                    onClose={() => setShowCreateOrderPurchase(false)}
                    fetchData={fetchData}
                />
            )}
        </div>
    );
};

export default ImportProduct;
