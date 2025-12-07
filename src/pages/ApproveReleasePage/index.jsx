import React, { use, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ApproveReleasePage.module.scss';
import { Button, ModelFilter, MyTable, PaginationUI } from '../../components';
import { Eye, PlusIcon } from 'lucide-react';
import ModalCreateApproveRelease from './ModalCreateApproveRelease';
import { getAllOrderReleaseProposal, getOrderReleaseProposal } from '../../services/proposal.service';
import { authIsAdmin, convertDateVN } from '../../common';
import ProposalStatus from '../../components/ProposalStatus';
import Tippy from '@tippyjs/react';
import { useSelector } from 'react-redux';

const cx = classNames.bind(styles);

const ApproveReleasePage = () => {
    const [isCreate, setIsCreate] = useState(false); // open model create approve release
    const [isProposalSelected, setIsProposalSelected] = useState(false);
    const [proposalDetail, setProposalDetail] = useState(null);
    const [proposalReleaseList, setProposalReleaseList] = useState([]);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        orderReleaseProposalID: '',
        createdAt: '',
        employeeIDCreate: '',
        status: 'PENDING',
    });
    const [totalPage, setTotalPage] = useState(0);

    const columnsFilter = [
        {
            label: 'Mã phiếu đề xuất',
            dataIndex: 'orderReleaseProposalID',
            key: 'orderReleaseProposalID',
            value: filters.orderReleaseProposalID,
            setValue: (value) => setFilters({ ...filters, orderReleaseProposalID: value }),
        },
        {
            label: 'Ngày tạo',
            dataIndex: 'createdDate',
            key: 'createdDate',
            type: 'date',
            value: filters.createdAt,
            setValue: (value) => setFilters({ ...filters, createdAt: value }),
        },
        {
            label: 'Mã người tạo',
            dataIndex: 'employeeIDCreate',
            key: 'employeeIDCreate',
            value: filters.employeeID,
            setValue: (value) => setFilters({ ...filters, employeeIDCreate: value }),
        },
    ];

    const selectFilter = [
        {
            label: 'Trạng thái',
            option: [
                { name: 'Đã phê duyệt', value: 'COMPLETED' },
                { name: 'Chờ phê duyệt', value: 'PENDING' },
                {
                    name: 'Từ chối',
                    value: 'REFUSED',
                },
            ],
            value: filters.status,
            setValue: (value) => setFilters({ ...filters, status: value }),
        },
    ];

    const tableColumns = [
        {
            title: 'Mã phiếu xuất',
            dataIndex: 'orderReleaseProposalID',
            key: 'orderReleaseProposalID',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '20%',
            render: (text) => <p className={cx('text')}>{convertDateVN(text)}</p>,
        },
        {
            title: 'Người tạo',
            dataIndex: 'employeeName',
            key: 'employeeName',
            width: '20%',
            render: (_, record) => <p className={cx('text')}>{record?.creator?.employeeName}</p>,
        },
        {
            title: 'Tên kho',
            dataIndex: 'warehouseName',
            key: 'warehouseName',
            width: '17%',
            render: (_, record) => <p className={cx('text')}>{record?.warehouse?.warehouseName}</p>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (index, record) => <ProposalStatus index={index} record={record} />,
        },
        {
            title: 'Chi tiết',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <div style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}>
                    <Tippy content="Xem chi tiết" placement="bottom">
                        <Eye
                            size={20}
                            onClick={() => {
                                setIsProposalSelected(record.orderReleaseProposalID);
                                handleOpenDetailOrderReleaseProposal(record.orderReleaseProposalID);
                            }}
                        />
                    </Tippy>
                </div>
            ),
        },
    ];

    const handleSubmitFilter = async () => {
        const validFiler = Object.keys(filters).some((key) => filters[key]);
        if (!validFiler) return;
        console.log('Submit filter', filters);
        try {
            const res = await getAllOrderReleaseProposal(page, filters);
            console.log('res filter', res);
            setProposalReleaseList(res.data.length > 0 ? res.data : []);
            setPage(Number.parseInt(res?.pagination?.currentPage) || 0);
            setTotalPage(res?.pagination?.totalPages || 0);
        } catch (err) {
            console.log(err);
            setProposalReleaseList([]);
        }
    };

    const handleResetFilter = () => {
        fetchAllOrderReleaseProposal(1, 'PENDING');
        setFilters({
            orderReleaseProposalID: '',
            createdAt: '',
            employeeIDCreate: '',
            status: 'PENDING',
        });
    };

    const onChangePage = (newPage) => {
        setPage(newPage);
    };

    const fetchAllOrderReleaseProposal = async (page = 1, status = 'PENDING') => {
        try {
            const res = await getAllOrderReleaseProposal(page, { status });
            setProposalReleaseList(res?.data?.length > 0 ? res.data : []);
            setPage(Number.parseInt(res.pagination.currentPage) || 0);
            setTotalPage(res.pagination.totalPages || 0);
        } catch (err) {
            console.log(err);
        }
    };

    const handleOpenDetailOrderReleaseProposal = async (orderReleaseProposalID) => {
        try {
            const res = await getOrderReleaseProposal(orderReleaseProposalID);
            console.log(res);
            setProposalDetail(res);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchAllOrderReleaseProposal(page, 'PENDING');
    }, []);

    useEffect(() => {
        if (!isProposalSelected) return;
    }, [isProposalSelected]);

    return (
        <div className={cx('wrapper-approve-release-page')}>
            <ModelFilter
                columns={columnsFilter}
                handleResetFilters={handleResetFilter}
                handleSubmitFilter={handleSubmitFilter}
                selectInput={selectFilter}
            >
                <Button primary medium onClick={() => setIsCreate(true)} leftIcon={<PlusIcon size={20} />}>
                    <span>Tạo phiếu đề xuất xuất</span>
                </Button>
            </ModelFilter>

            <div className={cx('content')}>
                <h1 className={cx('title-table')}>Danh sách phiếu đề xuất xuất</h1>
                {/* Table content */}
                <MyTable
                    columns={tableColumns}
                    data={proposalReleaseList}
                    onChangePage={onChangePage}
                    currentPage={page}
                    pagination={true}
                    pageSize={5}
                    total={totalPage * 5}
                />
            </div>

            {/** create approve proposal */}
            {isCreate && (
                <ModalCreateApproveRelease
                    isOpen={isCreate}
                    onClose={() => setIsCreate(false)}
                    refetchData={() => fetchAllOrderReleaseProposal(page)}
                />
            )}

            {/** approve proposal */}
            {isProposalSelected && (
                <ModalCreateApproveRelease
                    typeDetail={true}
                    isOpen={isProposalSelected}
                    initialData={proposalDetail}
                    onClose={() => setIsProposalSelected(false)}
                    refetchData={() => fetchAllOrderReleaseProposal(page)}
                />
            )}
        </div>
    );
};

export default ApproveReleasePage;
