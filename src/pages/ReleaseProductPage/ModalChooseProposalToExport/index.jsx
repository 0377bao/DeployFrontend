import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalChooseProposalToExport.module.scss';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import { Modal, Button, MyTable } from '../../../components';
import { getAllOrderReleaseProposalCanApply, searchOrderReleaseProposal } from '../../../services/proposal.service';
import { convertDateVN } from '../../../common';
import useDebounce from '../../../hooks/useDebounce';
import CreateExportProductDialog from '../CreateExportProductDialog';

const cx = classNames.bind(styles);
const cxGlobal = classNames.bind(globalStyle);

const ModalChooseProposalToExport = ({ isOpen, onClose, fetchData }) => {
    const [proposalIDFilter, setProposalIDFilter] = useState('');
    const [listData, setListData] = useState([]);
    const [proposalSelected, setProposalSelected] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const debounceProposalIDFilter = useDebounce(proposalIDFilter, 500);

    const handleFetchOrderReleaseProposal = async () => {
        try {
            const res = await getAllOrderReleaseProposalCanApply();
            setListData(res.length > 0 ? res : []);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (!debounceProposalIDFilter.trim()) {
            handleFetchOrderReleaseProposal();
            return;
        } else {
            const searchDate = async () => {
                const res = await searchOrderReleaseProposal(debounceProposalIDFilter.trim(), { status: 'COMPLETED' });
                if (res.data.status === 'OK') {
                    setListData(res.data.data || []);
                }
            };

            searchDate();
        }
    }, [debounceProposalIDFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [listData]);

    const handleRefreshData = () => {
        //handleFetchOrderReleaseProposal();
        fetchData();
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            setProposalIDFilter('');
            return;
        } else handleFetchOrderReleaseProposal();
    }, [isOpen]);

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            render: (_, __, index) => (currentPage - 1) * 5 + index + 1,
            width: 60,
            align: 'center',
        },
        {
            title: 'Mã phiếu đề xuất',
            dataIndex: 'orderReleaseProposalID',
            key: 'orderReleaseProposalID',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => convertDateVN(text),
        },
        {
            title: 'Nhân viên lập phiếu',
            dataIndex: ['creator', 'employeeName'],
            key: 'employeeName',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div className={cxGlobal('action-table')}>
                    <Button success medium onClick={() => setProposalSelected(record)}>
                        <span>Xuất hàng</span>
                    </Button>
                </div>
            ),
            align: 'center',
        },
    ];

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose}>
            <div className={cx('wrapper')}>
                <div className={cx('wrapper-filter')}>
                    <div className={cx('form-group')}>
                        <label htmlFor={proposalIDFilter}>Mã phiếu đề xuất</label>
                        <input
                            type="text"
                            id="proposalID"
                            className={cx('form-input')}
                            placeholder={`Nhập mã phiếu đề xuất`}
                            value={proposalIDFilter}
                            onChange={(e) => setProposalIDFilter(e.target.value)}
                        />
                    </div>
                </div>
                <div className={cx('wrapper-table')}>
                    <MyTable
                        columns={columns}
                        data={listData}
                        pagination={true}
                        pageSize={5}
                        currentPage={currentPage}
                        onChangePage={(page) => setCurrentPage(page)}
                        total={listData.length}
                        rowKey="orderReleaseProposalID"
                    />
                </div>
            </div>

            {proposalSelected && (
                <CreateExportProductDialog
                    isOpen={!!proposalSelected}
                    onClose={() => setProposalSelected(null)}
                    proposalRelease={proposalSelected}
                    fetchData={handleRefreshData}
                />
            )}
        </Modal>
    );
};

export default ModalChooseProposalToExport;
