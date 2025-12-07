import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './BatchDialog.module.scss';
import { Modal } from '@/components';
import { Button, Input, MyTable, Select } from '../../../components';
import InputBase from '../../../components/InputBase';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { useDispatch, useSelector } from 'react-redux';
import { addBatchProductList, clearAllBatchProductList } from '../../../lib/redux/batchProduct/BatchProduct';
import BatchBoxDialog from '../BatchBoxDialog';
import { getAllBatchWithProductID, suggestBatchProductForExport } from '../../../services/batch.service';
import { formatDate } from '../../../utils/formatDate';
import SuggestBatchExportDialog from '../SuggestBatchExportDialog';

const cx = classNames.bind(styles);

const BatchDialog = ({ product, isOpen, onClose }) => {
    const [batchProductSelected, setBatchProductSelected] = useState(null);
    const batchOfProductStore = useSelector((state) => state.BatchProductSlice.batchProductList);
    const dispatch = useDispatch();
    const batchOfProductSelected = useMemo(() => {
        if (!product?.productID) return [];
        if (!batchOfProductStore) return [];
        return batchOfProductStore[product.productID] || [];
    }, [batchOfProductStore, product]);
    const [batchProductList, setBatchProductList] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState([]); // danh sách lô đã chọn
    const [isOpenLocationBatch, setIsOpenLocationBatch] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 7;
    const [searchValue, setSearchValue] = useState('');
    const [isShowSuggestBox, setIsShowSuggestBox] = useState(false);
    const [selectSuggest, setSelectSuggest] = useState('');

    const onChangePage = (page) => {
        setCurrentPage(page);
    };

    const handleBatchSelect = (batch) => {
        const checkExist = selectedBatch.findIndex((item) => item.batchID === batch.batchID);
        if (checkExist === -1) setSelectedBatch((prev) => [...prev, batch]);
        else setSelectedBatch((prev) => prev.filter((item) => item.batchID !== batch.batchID));
    };

    const checkExistBatch = (batchID) => {
        return selectedBatch.findIndex((item) => item.batchID === batchID) !== -1;
    };

    const updateQuantityBatch = (batchID, quantity) => {
        const index = selectedBatch.findIndex((item) => item.batchID === batchID);
        if (index === -1) return;
        const updatedBatch = [...selectedBatch];
        updatedBatch[index].quantity = quantity;
        setSelectedBatch(updatedBatch);

        // Cập nhật batchProductList để re-render UI
        const updatedBatchProductList = batchProductList.map((item) =>
            item.batchID === batchID ? { ...item, quantity: quantity } : item,
        );
        setBatchProductList(updatedBatchProductList);
    };

    const handleFetchBatchList = async (productID) => {
        try {
            const res = await getAllBatchWithProductID(productID);
            const formatBatch = res.map((it) => ({
                batchID: it.batchID,
                manufactureDate: it.manufactureDate,
                expiryDate: it.expiryDate,
                location: it?.location || [],
                available: it.remainAmount,
                uom: it.unit.unitName,
                unitID: it.unit.unitID,
                quantity: 0,
            }));
            setBatchProductList(formatBatch);
        } catch (err) {
            console.log(err);
        }
    };

    const prefetchBatchList = async (productID, batchOfProductSelected) => {
        try {
            const res = await getAllBatchWithProductID(productID);
            const formatBatch = res.map((it) => ({
                batchID: it.batchID,
                manufactureDate: it.manufactureDate,
                expiryDate: it.expiryDate,
                location: it?.location || [],
                available: it.remainAmount,
                uom: it.unit.unitName,
                quantity: 0,
            }));
            const batchIDList = batchOfProductSelected.map((it) => it.batchID);
            const updateData = formatBatch
                .map((it) =>
                    batchIDList.includes(it.batchID)
                        ? { ...it, quantity: batchOfProductSelected.find((b) => b.batchID === it.batchID).quantity }
                        : it,
                )
                .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
            // ưu tiên những lô đã chọn lên đầu
            const batchPriority = updateData.filter((it) => batchIDList.includes(it.batchID));
            const batchNormal = updateData.filter((it) => !batchIDList.includes(it.batchID));

            setSelectedBatch(batchOfProductSelected);
            setBatchProductList([...batchPriority, ...batchNormal]);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (batchOfProductSelected.length > 0) {
            prefetchBatchList(product.productID, batchOfProductSelected);
        } else {
            //setBatchProductList(mockData);
            handleFetchBatchList(product.productID);
        }
    }, []);

    const tableColumns = [
        {
            title: 'Mã lô hàng',
            dataIndex: 'batchID',
            key: 'batchID',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="checkbox"
                        checked={checkExistBatch(record.batchID)}
                        onChange={() => handleBatchSelect(record)}
                        style={{ marginRight: '8px' }}
                    />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: 'Ngày sản xuất',
            dataIndex: 'manufactureDate',
            key: 'manufactureDate',
            sorter: (a, b) => new Date(a.manufactureDate) - new Date(b.manufactureDate),
            render: (text) => <p className={cx('cell-text')}>{formatDate(text)}</p>,
        },
        {
            title: 'Hạn sử dụng',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            sorter: (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
            render: (text) => <p className={cx('cell-text')}>{formatDate(text)}</p>,
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'uom',
            key: 'uom',
            render: (text) => <p className={cx('cell-text')}>{text}</p>,
        },
        {
            title: 'Số lượng hiện có',
            dataIndex: 'available',
            key: 'available',
            sorter: (a, b) => a.available - b.available,
            render: (text) => <p className={cx('cell-number')}>{text}</p>,
            width: '14%',
        },
        {
            title: 'Số lượng xuất',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text, record) => (
                <div className={cx('cell-text')}>
                    <input
                        type="number"
                        min={0}
                        max={record.available}
                        value={record.quantity || 0}
                        onChange={(e) => updateQuantityBatch(record.batchID, Number.parseInt(e.target.value) || 0)}
                        disabled={!checkExistBatch(record.batchID)}
                        onBlur={() => {
                            if (record.quantity > record.available) {
                                updateQuantityBatch(record.batchID, 0);
                                toast.error('Số lượng xuất không được lớn hơn số lượng hiện có', styleMessage);
                                return;
                            }
                        }}
                        style={{
                            width: '50px',
                            padding: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            textAlign: 'center',
                        }}
                    />
                </div>
            ),
        },
        {
            title: 'Vị trí',
            dataIndex: 'location',
            key: 'location',
            render: (_, record) => (
                <div className={cx('cell-text', 'location-cell')}>
                    <Button
                        medium
                        success
                        rounded
                        disabled={!checkExistBatch(record.batchID) || record.quantity <= 0}
                        onClick={() => {
                            setBatchProductSelected(record);
                            setIsOpenLocationBatch(true);
                        }}
                    >
                        Chọn vị trí lô
                    </Button>
                </div>
            ),
        },
    ];

    const handleSearchBatch = (batchID) => {
        if (!batchID || batchID.trim() === '') {
            if (selectedBatch.length > 0) {
                const batchIDList = selectedBatch.map((it) => it.batchID);
                const updateMockData = mockData
                    .map((it) =>
                        batchIDList.includes(it.batchID)
                            ? { ...it, quantity: selectedBatch.find((b) => b.batchID === it.batchID).quantity }
                            : it,
                    )
                    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
                console.log(selectedBatch);
                setBatchProductList(updateMockData);
                return;
            } else {
                setBatchProductList(mockData);
            }
        } else {
            const filtered = mockData.filter((item) => item.batchID.toLowerCase().includes(batchID.toLowerCase()));
            if (filtered.length === 0) {
                toast.error('Không tìm thấy lô hàng phù hợp', styleMessage);
            } else {
                setBatchProductList(filtered);
            }
        }
    };

    const handleSuggestBatch = async (productID, priority) => {
        try {
            const res = await suggestBatchProductForExport(productID, priority);
            if (res && res.length > 0) {
                const formatBatch = res.map((it) => ({
                    batchID: it.batchID,
                    manufactureDate: it.manufactureDate,
                    expiryDate: it.expiryDate,
                    location: it?.location || [],
                    available: it.remainAmount,
                    uom: it.unit.unitName,
                    unitID: it.unit.unitID,
                    quantity: 0,
                }));
                setBatchProductList(formatBatch);
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
                <div className={cx('wrapper-batch-dialog')}>
                    <div className={cx('header-batch-dialog-wrapper')}>
                        <p className={cx('header-batch-dialog')}>Danh sách lô hàng cho sản phẩm</p>
                        {/* <InputBase
                            placeholder="Tìm kiếm theo mã lô"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onClick={() => handleSearchBatch(searchValue)}
                        /> */}
                        <div className={cx('group-suggest')}>
                            <span className={cx('label')}>Sắp xếp</span>
                            <Select
                                classNames={cx('custom-select')}
                                placeholder="Lựa chọn tiêu chí"
                                options={[
                                    {
                                        name: 'Theo hạn sử dụng',
                                        value: 'expirePriority',
                                    },
                                    {
                                        name: 'Theo thời gian nhập kho',
                                        value: 'rankPriority',
                                    },
                                ]}
                                onChange={(e) => handleSuggestBatch(product.productID, e.target.value)}
                            />
                        </div>
                    </div>

                    <MyTable
                        data={batchProductList}
                        columns={tableColumns}
                        pagination
                        pageSize={pageSize}
                        currentPage={currentPage}
                        onChangePage={onChangePage}
                    />

                    <div className={cx('button-batch-dialog')}>
                        <Button
                            success
                            onClick={() => {
                                const checkQuantity = selectedBatch.some((it) => it.quantity > 0);
                                if (!checkQuantity) {
                                    toast.error('Vui lòng nhập số lượng xuất cho lô hàng', styleMessage);
                                    return;
                                }
                                // update batch to store
                                dispatch(addBatchProductList({ key: product.productID, value: selectedBatch }));

                                setSelectedBatch([]);
                                setBatchProductList([]);
                                onClose();
                            }}
                        >
                            <span>Xác nhận</span>
                        </Button>
                        <Button
                            primary
                            onClick={() => {
                                dispatch(clearAllBatchProductList({ key: product.productID }));
                                setSelectedBatch([]);
                                setBatchProductList([]);
                                onClose();
                            }}
                        >
                            <span>Đóng</span>
                        </Button>
                    </div>
                </div>
            </Modal>
            {isOpenLocationBatch && (
                <BatchBoxDialog
                    isOpen={isOpenLocationBatch}
                    onClose={() => setIsOpenLocationBatch(false)}
                    product={product}
                    batch={batchProductSelected}
                    requireQuantity={batchProductSelected.quantity}
                />
            )}
            {/* {isShowSuggestBox && (
                <SuggestBatchExportDialog
                    isOpen={isShowSuggestBox}
                    onClose={() => setIsShowSuggestBox(false)}
                    onSuggest={(priority) => handleSuggestBatch(product.productID, priority)}
                    onReset={() => handleFetchBatchList(product.productID)}
                />
            )} */}
        </>
    );
};

export default BatchDialog;
