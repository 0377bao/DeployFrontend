import React, { use, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModelCreateOrderPurchase.module.scss';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import { Modal, Button } from '../../../components';
import { fetchFilterProposal, fetchProposalMissingOrderPurchase } from '../../../services/proposal.service';
import parseToken from '../../../utils/parseToken';
import { fetchOrderMissing, filterOrderMissing } from '../../../services/order.service';
import { convertDateVN } from '../../../common';
import { formatStatusOrderPurchaseMissing } from '../../../constants';
import CreateImportReceiptDialog from '../CreateImportReceiptDialog';
import CreateImportReceiptMissingDialog from '../CreateImportReceiptMissingDialog';
import useDebounce from '../../../hooks/useDebounce';

const cx = classNames.bind(styles);
const cxGlobal = classNames.bind(globalStyle);

const columnsDefineMissingProposal = [
    {
        title: 'Mã phiếu thiếu',
        key: 'orderPurchaseMissingID',
    },
    {
        title: 'Ngày tạo',
        key: 'createdAt',
    },
    {
        title: 'Nhân viên lập phiếu',
        key: 'employeeIDCreate',
    },
    {
        title: 'Trạng thái',
        key: 'status',
    },
    {
        title: 'Hành động',
        key: 'action',
    },
];

const columnsDefineSuggestProposal = [
    {
        title: 'Mã phiếu đề xuất',
        key: 'proposalID',
    },
    {
        title: 'Ngày tạo',
        key: 'createdAt',
    },
    {
        title: 'Nhân viên lập phiếu',
        key: 'employeeIDCreate',
    },
    {
        title: 'Hành động',
        key: 'action',
    },
];

const ModelCreateOrderPurchase = ({ isOpen, onClose, fetchData }) => {
    const [proposalIDFilter, setProposalIDFilter] = useState('');
    const [missingIDFilter, setMissingIDFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('NORMAL');
    const [listData, setListData] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [proposalSelected, setProposalSelected] = useState(null);
    const [showModalCreate, setShowModalCreate] = useState(false);
    const [showModalCreateMissing, setShowModalCreateMissing] = useState(false);
    const debounceProposalIDFilter = useDebounce(proposalIDFilter, 500);
    const debounceMissingIDFilter = useDebounce(missingIDFilter, 500);
    const handleFetchProposalMissingOrderPurchase = async () => {
        const res = await fetchProposalMissingOrderPurchase();
        if (res.status === 'OK') {
            setListData(res.proposals);
        }
    };

    useEffect(() => {
        if (typeFilter === 'NORMAL') {
            if (!debounceProposalIDFilter.trim()) {
                handleFetchProposalMissingOrderPurchase();
                return;
            } else {
                const searchDate = async () => {
                    const res = await fetchFilterProposal({ proposalID: debounceProposalIDFilter.trim() });
                    if (res.status === 'OK') {
                        setListData(res.proposals || []);
                    }
                };
                searchDate();
            }
        } else {
            if (!debounceMissingIDFilter.trim()) {
                handleFetchOrderMissing();
                return;
            } else {
                const searchDate = async () => {
                    const res = await filterOrderMissing({ orderPurchaseMissingID: debounceMissingIDFilter.trim() });
                    if (res.data?.status === 'OK') {
                        setListData(res.data.data || []);
                    }
                };
                searchDate();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounceProposalIDFilter, debounceMissingIDFilter]);

    const handleFetchOrderMissing = async () => {
        const warehouse = parseToken('warehouse');
        const res = await fetchOrderMissing(warehouse.warehouseID);
        if (res.data?.status === 'OK') {
            setListData(res.data.data);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (typeFilter === 'NORMAL') {
                setProposalIDFilter('');
                handleFetchProposalMissingOrderPurchase();
            } else {
                setMissingIDFilter('');
                handleFetchOrderMissing();
            }
        };
        fetchData();
    }, [typeFilter]);

    useEffect(() => {
        if (!selectedRow) return;
        let indexFind =
            typeFilter != 'NORMAL'
                ? listData.findIndex((it) => it.orderPurchaseMissingID == selectedRow)
                : listData.findIndex((it) => it.proposalID == selectedRow);
        if (indexFind == -1) return;

        if (typeFilter == 'NORMAL') {
            setProposalSelected(listData[indexFind]);
            setShowModalCreate(true);
        } else {
            setProposalSelected(listData[indexFind]);
            setShowModalCreateMissing(true);
        }
    }, [selectedRow]);

    useEffect(() => {
        console.log('listData', listData);
        console.log('typeFilter', typeFilter);
    }, [listData, typeFilter]);

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose}>
            <div className={cx('wrapper')}>
                <div className={cx('wrapper-filter')}>
                    {typeFilter === 'NORMAL' ? (
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
                    ) : (
                        <div className={cx('form-group')}>
                            <label htmlFor={missingIDFilter}>Mã phiếu bổ sung</label>
                            <input
                                type="text"
                                id="missingID"
                                className={cx('form-input')}
                                placeholder={`Nhập mã phiếu bổ sung`}
                                value={missingIDFilter}
                                onChange={(e) => setMissingIDFilter(e.target.value)}
                            />
                        </div>
                    )}
                    <div className={cx('form-group')}>
                        <label htmlFor="typeFilter">Loại phiếu nhập</label>
                        <select id="typeFilter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option disabled></option>
                            {[
                                { name: 'Phiếu nhập từ phiếu đề xuất', value: 'NORMAL' },
                                { name: 'Phiếu nhập bổ sung', value: 'SUPPLEMENT' },
                            ].map((opt) => (
                                <option key={opt.name} value={opt.value}>
                                    {opt.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className={cx('wrapper-table')}>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th className={cx('stt')}>STT</th>
                                {typeFilter === 'NORMAL'
                                    ? columnsDefineSuggestProposal.map((col) => (
                                          <th key={col.key} className={cx(col.key)}>
                                              {col.title}
                                          </th>
                                      ))
                                    : columnsDefineMissingProposal.map((col) => (
                                          <th key={col.key} className={cx(col.key)}>
                                              {col.title}
                                          </th>
                                      ))}
                            </tr>
                        </thead>
                        <tbody>
                            {listData?.map((data, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <p>{typeFilter === 'NORMAL' ? data.proposalID : data.orderPurchaseMissingID}</p>
                                    </td>
                                    <td>
                                        <p>{convertDateVN(data.createdAt)}</p>
                                    </td>
                                    <td>
                                        <p>
                                            {typeFilter === 'NORMAL'
                                                ? data.employeeCreate?.employeeName
                                                : data.orderPurchase?.employee?.employeeName}
                                        </p>
                                    </td>
                                    {typeFilter === 'SUPPLEMENT' && (
                                        <td>
                                            <p>{formatStatusOrderPurchaseMissing[data.status]}</p>
                                        </td>
                                    )}
                                    <td>
                                        <div className={cxGlobal('action-table')}>
                                            <Button
                                                success
                                                medium
                                                onClick={() => {
                                                    setSelectedRow(
                                                        data[
                                                            typeFilter === 'NORMAL'
                                                                ? 'proposalID'
                                                                : 'orderPurchaseMissingID'
                                                        ],
                                                    );
                                                }}
                                            >
                                                <span>Nhập hàng</span>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {showModalCreate && (
                <CreateImportReceiptDialog
                    isOpen={showModalCreate}
                    onClose={() => {
                        onClose();
                        setSelectedRow([]);
                        setShowModalCreate(false);
                    }}
                    proposalItem={proposalSelected}
                    handleFetchProposalMissingOrderPurchase={fetchData}
                />
            )}

            {showModalCreateMissing && (
                <CreateImportReceiptMissingDialog
                    isOpen={showModalCreateMissing}
                    onClose={() => {
                        onClose();
                        setSelectedRow([]);
                        setShowModalCreateMissing(false);
                    }}
                    orderPurchaseMissing={proposalSelected}
                    handleFetchOrderMissing={fetchData}
                />
            )}
        </Modal>
    );
};

export default ModelCreateOrderPurchase;
