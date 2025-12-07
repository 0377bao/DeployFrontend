import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './BatchBoxDialog.module.scss';
import MyTable from '../../../components/MyTable';
import InputBase from '../../../components/InputBase';
import { getBoxesByBatchID } from '../../../services/box.service';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { useDispatch, useSelector } from 'react-redux';
import { addLocationInBatchProductList } from '../../../lib/redux/batchProduct/BatchProduct';
import { Button, Modal } from '../../../components';

const cx = classNames.bind(styles);

// Props: isOpen, onClose, onConfirm, initialData (array of batches)
const BatchBoxDialog = ({ isOpen = true, onClose = () => {}, batch, product, requireQuantity }) => {
    const batchBoxProductList = useSelector((state) => state.BatchProductSlice.batchBoxProductList);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rows, setRows] = useState([]);
    const [preview, setPreview] = useState(false);
    const dispatch = useDispatch();

    const [disabledKeys, setDisabledKeys] = useState([]);

    const columns = useMemo(
        () => [
            {
                title: 'Mã box',
                dataIndex: 'boxID',
                key: 'boxID',
                width: '15%',
            },
            {
                title: 'Tên box',
                dataIndex: 'boxName',
                key: 'boxName',
            },
            {
                title: 'Vị trí',
                dataIndex: 'location',
                key: 'location',
                width: '25%',
                render: (_, record) => <span>{record.boxFloor}</span>,
            },
            {
                title: 'Số lượng hiện có',
                dataIndex: 'available',
                key: 'available',
                align: 'center',
                width: '15%',
                render: (_, record) => <span>{record.amountAvailable}</span>,
            },
            {
                title: 'Số lượng xuất',
                dataIndex: 'qty',
                key: 'qty',
                align: 'center',
                render: (_, record) => (
                    <input
                        type="number"
                        min={0}
                        max={record.amountAvailable}
                        value={record.qty || 0}
                        onChange={(e) => {
                            const v = e.target.value === '' ? '' : Number(e.target.value);
                            handleQuantityChange(v, record);
                        }}
                        className={cx('qty-input')}
                        disabled={!selectedRowKeys.includes(record.boxID) || record.amountAvailable === 0}
                    />
                ),
                width: '15%',
            },
        ],
        [selectedRowKeys],
    );

    const getTotalSelectedQty = (data, selected) =>
        data.filter((r) => selected.includes(r.boxID)).reduce((sum, r) => sum + (r.qty || 0), 0);

    const handleQuantityChange = (value, record) => {
        const newRows = rows.map((r) => (r.boxID === record.boxID ? { ...r, qty: value } : r));
        setRows(newRows);

        const totalQty = getTotalSelectedQty(newRows, selectedRowKeys);

        if (totalQty === requireQuantity) {
            const updateSelectRowKey = [...selectedRowKeys, record.boxID];
            setSelectedRowKeys((prev) => [...prev, record.boxID]);

            setDisabledKeys(
                newRows
                    .filter((r) => r.boxID !== record.boxID && !updateSelectRowKey.includes(r.boxID))
                    .map((r) => r.boxID),
            );
        } else if (totalQty < requireQuantity) {
            setDisabledKeys([]);
        }
    };

    const isRowDisabled = (record) => disabledKeys.includes(record.boxID);

    const rowSelection = {
        type: 'checkbox',
        hideSelectAll: true,
        selectedRowKeys,
        onChange: (keys) => {
            if (preview) {
                setDisabledKeys([]);
                setPreview(false); // chỉ check lần đầu tiên
            }
            setSelectedRowKeys(keys);
        },
        getCheckboxProps: (record) => ({
            disabled: isRowDisabled(record),
        }),
        getCheckboxPropsDependencies: [rows, selectedRowKeys],
    };

    const handleConfirm = () => {
        const totalBoxQuantity = rows
            .filter((r) => selectedRowKeys.includes(r.boxID))
            .reduce((total, cur) => total + (cur.qty || 0), 0);
        const boxSelectedListToExport = rows
            .filter((r) => selectedRowKeys.includes(r.boxID) && r.qty > 0)
            .map((box) => ({ ...box, quantityExported: box.qty }));
        if (!selectedRowKeys.length) {
            toast.error(`Vui lòng chọn ít nhất 1 ô để xuất`, styleMessage);
            return;
        }
        if (totalBoxQuantity > requireQuantity || totalBoxQuantity < requireQuantity) {
            toast.error(`Số lượng xuất phải đúng bằng số lượng yêu cầu là ${requireQuantity} thùng`, styleMessage);
            return;
        }

        dispatch(
            addLocationInBatchProductList({
                key: product.productID,
                batchID: batch.batchID,
                newLocation: boxSelectedListToExport,
            }),
        );
        onClose();
    };

    const handleSearchBoxOfBatch = (searchValue) => {
        setQuery(searchValue);
    };

    const handleFetchAllBoxForBatch = async (batchID) => {
        try {
            const res = await getBoxesByBatchID(batchID);
            const formatBatch = res.map((box) => ({
                key: box.boxID,
                boxID: box.boxID,
                boxName: box.boxName,
                boxFloor: box.floorID,
                amountAvailable: box.batch_boxes.quantity,
                amountGet: 0,
                status: box.status,
                shelf: box?.floor?.shelf?.shelfName || '',
            }));
            const boxSelected = batchBoxProductList[`${product.productID}-${batch.batchID}`] || [];
            const boxSelectedIDs = boxSelected.map((box) => box.boxID);
            const totalBoxQuantity = boxSelected.reduce((b, cur) => b + cur.qty, 0);
            const applyBatchBoxQuantity = formatBatch.map((box) =>
                boxSelectedIDs.includes(box.boxID)
                    ? {
                          ...box,
                          qty: boxSelected.find((b) => b.boxID === box.boxID)?.quantityExported || 0,
                      }
                    : box,
            );
            setSelectedRowKeys(boxSelectedIDs);
            if (boxSelected.length != 0 && totalBoxQuantity === requireQuantity) {
                setDisabledKeys(
                    applyBatchBoxQuantity.filter((box) => !boxSelectedIDs.includes(box.boxID)).map((it) => it.boxID),
                );
                setPreview(true);
            }

            setRows(applyBatchBoxQuantity); // box data
        } catch (err) {
            console.log(err);
        }
    };

    const handleCloseBatchBoxDialog = () => {
        setSelectedRowKeys([]);
        onClose();
    };

    useEffect(() => {
        if (!batch?.batchID) return;
        handleFetchAllBoxForBatch(batch.batchID);
    }, [batch?.batchID]);

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('wrapper-batch-dialog')}>
                <div className={cx('header-batch-dialog-wrapper')}>
                    <p className={cx('header-batch-dialog')}>Danh sách lô hàng cho sản phẩm</p>
                    <InputBase
                        placeholder="Tìm kiếm theo mã ô"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onClick={() => handleSearchBoxOfBatch(query)}
                    />
                </div>

                <MyTable
                    data={rows}
                    columns={columns}
                    pagination
                    rowSelection={rowSelection}
                    currentPage={page}
                    scroll={{ y: 200 }}
                />

                <div className={cx('button-batch-dialog')}>
                    <Button success onClick={handleConfirm}>
                        <span>Xác nhận</span>
                    </Button>
                    <Button primary onClick={handleCloseBatchBoxDialog}>
                        <span>Đóng</span>
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default BatchBoxDialog;
