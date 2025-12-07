import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ApprovePage.module.scss';
import { Button, ModelFilter, MyTable, PaginationUI } from '../../components';
import globalStyle from '../../components/GlobalStyle/GlobalStyle.module.scss';
import { post } from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';
import { formatStatusProposal } from '../../constants';
import Tippy from '@tippyjs/react';
import { Eye, Plus } from 'lucide-react';
import ModelProposalDetail from './ModelProposalDetail';
import { authIsAdmin, convertDateVN } from '../../common';
import ProposalStatus from '../../components/ProposalStatus';
import { useSelector } from 'react-redux';

const cx = classNames.bind(styles);
const cxGlobal = classNames.bind(globalStyle);

const ApprovePage = () => {
    const pageSize = 5;
    const [page, setPage] = useState(1);
    const [proposalPurchaseList, setProposalPurchaseList] = useState([]);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [typeDetail, setTypeDetail] = useState(true);
    const [proposalDetailID, setProposalDetailID] = useState(null);
    const [filterProposal, setFilterProposal] = useState({
        proposalID: '',
        createdAt: '',
        status: 'PENDING',
        employeeName: '',
    });
    const [totalPage, setTotalPage] = useState(0);
    const employee = useSelector((state) => state.AuthSlice.user);

    const columnsFilter = [
        {
            id: 1,
            label: 'Mã phiếu đề xuất',
            value: filterProposal.proposalID,
            name: 'proposalID',
            setValue: (value) => setFilterProposal((prev) => ({ ...prev, proposalID: value })),
        },
        {
            id: 2,
            label: 'Ngày lập',
            value: filterProposal.createdAt,
            name: 'createdAt',
            type: 'date',
            setValue: (value) => setFilterProposal((prev) => ({ ...prev, createdAt: value })),
        },
        {
            id: 3,
            label: 'Mã người tạo',
            value: filterProposal.employeeName,
            name: 'employeeName',
            setValue: (value) => setFilterProposal((prev) => ({ ...prev, employeeName: value })),
        },
    ];

    const selectFilter = [
        {
            id: 3,
            label: 'Trạng thái',
            value: filterProposal.status,
            name: 'status',
            setValue: (value) => setFilterProposal((prev) => ({ ...prev, status: value })),
            option: [
                {
                    name: 'Chờ phê duyệt',
                    value: 'PENDING',
                },
                {
                    name: 'Đã phê duyệt',
                    value: 'APPROVED',
                },
                {
                    name: 'Đã từ chối',
                    value: 'REFUSE',
                },
                {
                    name: 'Đã hoàn thành',
                    value: 'COMPLETED',
                },
            ],
        },
    ];

    const columnsTable = [
        {
            title: 'Mã phiếu đề xuất nhập',
            dataIndex: 'proposalID',
            key: 'proposalID',
        },
        {
            title: 'Ngày lập',
            dataIndex: 'createdAt',
            key: 'createAt',
            render: (text) => {
                return <p className={cx('text')}>{convertDateVN(text)}</p>;
            },
        },
        {
            title: 'Tên người tạo',
            dataIndex: 'employeeName',
            key: 'employeeName',
            render: (_, record) => <p className={cx('text')}>{record?.employeeCreate?.employeeName}</p>,
        },
        {
            title: 'Tên kho',
            dataIndex: 'warehouseName',
            key: 'warehouseName',
            render: (_, record) => <p className={cx('text')}>{record?.warehouse?.warehouseName}</p>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (index, record) => {
                return <ProposalStatus index={index} record={record} />;
            },
        },
        {
            title: 'Chi tiết',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                return (
                    <div className={cxGlobal('action-table')}>
                        <Tippy content={'Xem chi tiết'} placement="bottom-end">
                            <button
                                className={cxGlobal('action-table-icon')}
                                onClick={() => {
                                    setTypeDetail(true);
                                    setProposalDetailID(record.proposalID);
                                    setShowModalDetail(true);
                                }}
                            >
                                <Eye size={20} />
                            </button>
                        </Tippy>
                    </div>
                );
            },
        },
    ];

    // const fetchProposals = async (page = 1) => {
    //     try {
    //         const token = parseToken('tokenUser');
    //         const res = await post(
    //             '/api/proposal/filter-proposal',
    //             {
    //                 status: 'PENDING',
    //                 page,
    //             },
    //             token.accessToken,
    //             token.employeeID,
    //         );
    //         setProposalPurchaseList(res.proposals || []);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // };

    const handleResetFilter = () => {
        setFilterProposal({
            proposalID: '',
            createdAt: '',
            status: 'PENDING',
            employeeName: '',
        });
        setPage(1);
        handleSearch({
            proposalID: '',
            createdAt: '',
            employeeName: '',
            pageFilter: 1,
            status: 'PENDING',
        });
    };

    const handleSearch = async ({
        proposalID = filterProposal.proposalID,
        createdAt = filterProposal.createdAt,
        status = filterProposal.status,
        employeeName = filterProposal.employeeName,
        pageFilter = page,
    }) => {
        if (!Object.keys(filterProposal).some((key) => filterProposal[key])) return;
        try {
            const token = parseToken('tokenUser');
            const res = await post(
                '/api/proposal/filter-proposal',
                {
                    proposalID,
                    createdAt,
                    status,
                    employeeName,
                    page: pageFilter,
                },
                token.accessToken,
                token.employeeID,
            );

            setProposalPurchaseList(res.proposals || []);
            setTotalPage(res.pagination.totalPages || 0);
        } catch (err) {
            console.log(err);
        }
    };

    const onChangePage = (page) => {
        setPage(page);
    };

    useEffect(() => {
        handleSearch({ pageFilter: 1, status: filterProposal.status });
    }, [filterProposal.status]);

    useEffect(() => {
        handleSearch({
            proposalID: filterProposal.proposalID,
            createdAt: filterProposal.createdAt,
            employeeName: filterProposal.employeeName,
            pageFilter: page,
            status: filterProposal.status,
        });
    }, [page]);

    return (
        <div className={cx('wrapper-approve')}>
            <ModelFilter
                columns={columnsFilter}
                handleResetFilters={handleResetFilter}
                selectInput={selectFilter}
                handleSubmitFilter={handleSearch}
            >
                {authIsAdmin(employee) ? (
                    <Button
                        primary
                        onClick={() => {
                            setTypeDetail(false);
                            setShowModalDetail(true);
                        }}
                        leftIcon={<Plus size={16} />}
                    >
                        <span>Tạo phiếu đề xuất</span>
                    </Button>
                ) : (
                    <></>
                )}
            </ModelFilter>
            <div className={cx('table-container-header')}>
                <h1 className={cx('title-approve')}>{`Danh sách phiếu đề xuất ${formatStatusProposal[
                    filterProposal.status
                ].toLowerCase()}`}</h1>
            </div>
            <div className={cx('table-container')}>
                <MyTable
                    //className={cx('my-table')}
                    columns={columnsTable}
                    data={proposalPurchaseList}
                    pagination
                    total={totalPage * 5}
                    pageSize={5}
                    onChangePage={onChangePage}
                    currentPage={page}
                />
            </div>
            {showModalDetail && (
                <ModelProposalDetail
                    proposalDetailID={proposalDetailID}
                    typeDetail={typeDetail}
                    isOpen={showModalDetail}
                    onClose={() => setShowModalDetail(false)}
                    handleSearch={handleResetFilter}
                />
            )}
        </div>
    );
};

export default ApprovePage;
