import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalBatchProductDetail.module.scss';
import { MyTable, Modal, Button } from '../../../components';
import { useDispatch, useSelector } from 'react-redux';
import { removeBatchProductList, removeItemInBatchProductList } from '../../../lib/redux/batchProduct/BatchProduct';
import { Trash2 } from 'lucide-react';
import { formatDate } from '../../../utils/formatDate';
import BatchBoxDialog from '../BatchBoxDialog';
import ModalBatchBoxProductDetail from '../ModalBatchBoxProductDetail';

const cx = classNames.bind(styles);

const ModalBatchProductDetail = ({ isOpen, onClose, productID }) => {
    const batchOfProductSelected = useSelector((state) => state.BatchProductSlice.batchProductList);
    const batchBoxListStore = useSelector((state) => state.BatchProductSlice.batchBoxProductList);
    const [batchList, setBatchProductList] = useState([]);
    const [batchIDSelected, setBatchIDSelected] = useState(null);
    const [isOpenBatchBox, setIsOpenBatchBox] = useState(false);
    const dispatch = useDispatch();
    const tableColumns = [
        {
            title: 'Mã lô',
            dataIndex: 'batchID',
            key: 'batchID',
            render: (text) => <p style={{ textAlign: 'center' }}>{text}</p>,
        },
        {
            title: 'Ngày sản xuất',
            dataIndex: 'manufactureDate',
            key: 'manufactureDate',
            render: (text) => <p style={{ textAlign: 'center' }}>{formatDate(text)}</p>,
        },
        {
            title: 'Ngày hết hạn',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            render: (text) => <p style={{ textAlign: 'center' }}>{formatDate(text)}</p>,
        },
        {
            title: 'Vị trí',
            dataIndex: 'location',
            key: 'location',
            render: (_, record) => (
                <div className={cx('group-location')}>
                    {record.location.map((re) => (
                        <p className={cx('position-item')}>{`${re.boxName} - ${re.boxFloor} - ${re.shelf}`}</p>
                    ))}
                </div>
            ),
            width: '30%',
        },
        {
            title: 'Số lượng xuất',
            dataIndex: 'quantity',
            key: 'quantity',
            width: '12%',
            render: (text) => <p style={{ textAlign: 'right', marginRight: 5 }}>{text}</p>,
        },
        {
            title: 'Xóa',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <p style={{ textAlign: 'center', cursor: 'pointer' }}>
                    <Trash2
                        size={20}
                        onClick={() => {
                            console.log('productID', productID);
                            dispatch(removeItemInBatchProductList({ key: productID, batchID: record.batchID }));
                        }}
                        color="red"
                    />
                </p>
            ),
            width: '10%',
        },
    ];

    useEffect(() => {
        if (!productID || !batchOfProductSelected) return;
        if (batchOfProductSelected[productID]?.length > 0) {
            const batchList = batchOfProductSelected[productID];
            const addLocationBatchList = batchList.map((ba) => {
                const batchLocation = batchBoxListStore[`${productID}-${ba.batchID}`];
                return {
                    ...ba,
                    location: [...batchLocation],
                };
            });

            setBatchProductList(addLocationBatchList);
        } else setBatchProductList([]);
    }, [batchOfProductSelected, productID]);

    return (
        <>
            <Modal isOpenInfo={isOpen} onClose={onClose}>
                <div className={cx('wrapper-modal-batch-product')}>
                    <div className={cx('table-product')}>
                        <p className={cx('table-title')}>Danh sách lô hàng cần xuất của sản phẩm</p>
                        <MyTable data={batchList} columns={tableColumns} />
                    </div>
                </div>
            </Modal>
            {isOpenBatchBox && (
                <ModalBatchBoxProductDetail
                    isOpen={isOpenBatchBox}
                    onClose={() => setIsOpenBatchBox(false)}
                    batchID={batchIDSelected}
                    productID={productID}
                />
            )}
        </>
    );
};

export default ModalBatchProductDetail;
