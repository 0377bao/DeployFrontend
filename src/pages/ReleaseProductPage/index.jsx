import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ReleaseProductPage.module.scss';
import { MyTable, Button, Modal, Select, ModelFilter, PaginationUI } from '../../components';
import { Plus } from 'lucide-react';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import request from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';
import ModalOrderReleaseDetail from './ModalOrderReleaseDetail';
import { filterOrderRelease } from '../../services/order.service';
import ModalChooseProposalToExport from './ModalChooseProposalToExport';
import { formatStatusOrderRelease } from '../../constants';

const cx = classNames.bind(styles);
const cxGlb = classNames.bind(globalStyle);

const ReleaseProductPage = () => {
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState([]);
    const [filterProposalRelease, setFilterProposalRelease] = useState({
        orderReleaseID: '',
        receiverName: '',
        employeeNameRelease: '',
        createdAt: '',
        status: 'ALL',
    });
    const [showModalCreateReleaseProposal, setShowModalCreateReleaseProposal] = useState(false);
    const [orderReleaseList, setOrderReleaseList] = useState([]);
    const [showOrderReleaseDetail, setShowOrderReleaseDetail] = useState(false);

    const columnsFilter = [
        {
            id: 1,
            label: 'Mã phiếu',
            dataIndex: 'orderReleaseID',
            key: 'orderReleaseID',
            setValue: (value) => setFilterProposalRelease({ ...filterProposalRelease, orderReleaseID: value }),
            value: filterProposalRelease.orderReleaseID,
        },
        {
            id: 2,
            label: 'Ngày tạo',
            type: 'date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            setValue: (value) => setFilterProposalRelease({ ...filterProposalRelease, createdAt: value }),
            value: filterProposalRelease.createdAt,
        },
        {
            id: 3,
            label: 'Tên người tạo',
            dataIndex: 'employeeName',
            key: 'employeeName',
            setValue: (value) => setFilterProposalRelease({ ...filterProposalRelease, employeeNameRelease: value }),
            value: filterProposalRelease.employeeNameRelease,
            render: (_, record) => <span>{record.employee.employeeName}</span>,
        },
        {
            id: 4,
            label: 'Tên người nhận',
            dataIndex: 'customerName',
            key: 'customerName',
            setValue: (value) => setFilterProposalRelease({ ...filterProposalRelease, receiverName: value }),
            value: filterProposalRelease.receiverName,
            render: (_, record) => <span>{record.customer.customerName}</span>,
        },
    ];

    const selectInput = [
        {
            label: 'Trạng thái',
            value: filterProposalRelease.status,
            option: [
                {
                    name: 'Tất cả',
                    value: 'ALL',
                },
                {
                    name: 'Đang chờ lấy hàng',
                    value: 'PENDING_PICK',
                },
                {
                    name: 'Đã hoàn thành',
                    value: 'COMPLETED',
                },
                {
                    name: 'Từ chối',
                    value: 'REFUSE',
                },
            ],
            setValue: (value) => setFilterProposalRelease({ ...filterProposalRelease, status: value }),
        },
    ];

    const tableColumnsExportProduct = [
        {
            title: 'Mã phiếu xuất',
            dataIndex: 'orderReleaseID',
            key: 'orderReleaseID',
        },
        {
            title: 'Ngày lập',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => <p className={cx('text')}>{text.split('T')[0]}</p>,
            width: '15%',
        },
        {
            title: 'Người tạo',
            dataIndex: 'employeeName',
            key: 'employeeName',
            render: (_, record) => <p className={cx('text')}>{record.employees.employeeName}</p>,
        },
        {
            title: 'Người nhận',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (_, record) => <p className={cx('text')}>{record.customers.customerName}</p>,
            width: '25%',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (index, record) => (
                <div className={cx('status-proposal')}>
                    <p className={cx('text')}>{formatStatusOrderRelease[record.status]}</p>
                </div>
            ),
            width: '20%',
        },
        {
            title: 'Thao tác',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                return (
                    <div
                        className={cxGlb('action-table')}
                        onClick={() => {
                            setSelectedRow(record);
                            setShowOrderReleaseDetail(true);
                        }}
                    >
                        <Button primary medium>
                            <span>Xem chi tiết</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

    const handleSubmitFilter = async (page = 1) => {
        try {
            let params = { page };
            if (filterProposalRelease.orderReleaseID) params.orderReleaseID = filterProposalRelease.orderReleaseID;
            if (filterProposalRelease.createdAt) params.createdAt = filterProposalRelease.createdAt;
            if (filterProposalRelease.employeeNameRelease)
                params.employeeName = filterProposalRelease.employeeNameRelease;
            if (filterProposalRelease.receiverName) params.customerName = filterProposalRelease.receiverName;
            if (filterProposalRelease.status && filterProposalRelease.status !== 'ALL')
                params.status = filterProposalRelease.status;

            console.log('params', params);

            const res = await filterOrderRelease(params);
            setOrderReleaseList(res.data || []);
            setCurrentPage(res?.pagination?.currentPage || 1);
            setTotalPages(res?.pagination?.totalPages);
        } catch (err) {
            console.log(err);
        }
    };

    const handleResetFilter = () => {
        // tránh spam request
        if (Object.keys(filterProposalRelease).every((key) => filterProposalRelease[key] == '')) return;
        setFilterProposalRelease({
            orderReleaseID: '',
            createdAt: '',
            employeeNameRelease: '',
            receiverName: '',
            status: 'ALL',
        });
        setCurrentPage(1);
        fetchOrderRelease(1);
    };

    const fetchOrderRelease = async (page = 1) => {
        try {
            const warehouse = parseToken('warehouse');
            const token = parseToken('tokenUser');
            const res = await request.get(
                `/api/order-release/get-all-order-release?warehouseID=${warehouse.warehouseID}&page=${page}`,
                {
                    headers: {
                        token: `Bearer ${token.accessToken}`,
                        employeeID: token.employeeID,
                        warehouseID: warehouse.warehouseID,
                    },
                },
            );
            setOrderReleaseList(res.data.data || []);
            setCurrentPage(res?.data?.pagination?.currentPage || 1);
            setTotalPages(res?.data?.pagination?.totalPages);
        } catch (err) {
            console.log(err);
        }
    };

    const onChangePage = (newPage) => setCurrentPage(newPage);

    useEffect(() => {
        const isFilterActive =
            filterProposalRelease.orderReleaseID ||
            filterProposalRelease.createdAt ||
            filterProposalRelease.employeeNameRelease ||
            filterProposalRelease.receiverName ||
            (filterProposalRelease.status && filterProposalRelease.status !== 'ALL');

        if (isFilterActive) {
            handleSubmitFilter(currentPage);
        } else {
            fetchOrderRelease(currentPage);
        }
    }, [currentPage]);

    return (
        <div className={cx('wrapper-release-product')}>
            <ModelFilter
                columns={columnsFilter}
                selectInput={selectInput}
                handleSubmitFilter={() => {
                    const isFilterActive =
                        filterProposalRelease.orderReleaseID ||
                        filterProposalRelease.createdAt ||
                        filterProposalRelease.employeeNameRelease ||
                        filterProposalRelease.receiverName ||
                        (filterProposalRelease.status && filterProposalRelease.status !== 'ALL');

                    if (currentPage === 1) {
                        if (isFilterActive) {
                            handleSubmitFilter(1);
                        } else {
                            fetchOrderRelease(1);
                        }
                    } else {
                        setCurrentPage(1);
                    }
                }}
                handleResetFilters={handleResetFilter}
            >
                <Button
                    type="button"
                    primary
                    onClick={() => {
                        setShowModalCreateReleaseProposal(true);
                    }}
                    leftIcon={<Plus size={16} />}
                >
                    Tạo phiếu xuất kho
                </Button>
            </ModelFilter>

            <ModalChooseProposalToExport
                isOpen={showModalCreateReleaseProposal}
                onClose={() => setShowModalCreateReleaseProposal(false)}
                fetchData={fetchOrderRelease}
            />

            {/** danh sách phiếu đề xuất hoặc phiếu thiếu */}
            <div className={cx('view-list-proposal')}>
                <div className={cx('table-header')}>
                    <p className={cx('table-title')}>Danh sách phiếu xuất kho</p>
                </div>

                <MyTable
                    data={orderReleaseList}
                    columns={tableColumnsExportProduct}
                    currentPage={currentPage}
                    onChangePage={onChangePage}
                    pagination
                    pageSize={5}
                    total={totalPages * 5}
                />
            </div>

            {/* Modal tạo phiếu xuất */}

            {showOrderReleaseDetail && (
                <ModalOrderReleaseDetail
                    isOpen={showOrderReleaseDetail}
                    onClose={() => setShowOrderReleaseDetail(false)}
                    orderReleaseItem={selectedRow} // phiếu được chọn
                />
            )}
        </div>
    );
};

export default ReleaseProductPage;
