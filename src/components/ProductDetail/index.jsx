import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal';
import styles from './ProductDetail.module.scss';
import classNames from 'classnames/bind';
import Image from '../Image';
import MyTable from '../MyTable';
import Button from '../Button';
import { Eye, QrCode } from 'lucide-react';
import { Tooltip } from 'antd';
import TooltipTable from '../TooltipTable';

const cx = classNames.bind(styles);

const RowItem = ({ firstTitle = '', firstValue = '', secondTitle = '', secondValue = '' }) => {
    return (
        <div className={cx('row-info')}>
            {firstTitle && firstValue && (
                <div className={cx('column-info')}>
                    <strong>{firstTitle}:</strong>
                    <span>{firstValue}</span>
                </div>
            )}
            {secondTitle && (
                <div className={cx('column-info')}>
                    <strong>{secondTitle}:</strong>
                    <span>{secondValue}</span>
                </div>
            )}
        </div>
    );
};

const ProductDetail = ({ data, classname, onClose }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showQRCode, setShowQRCode] = useState(false);
    const qrCodeRef = useRef();
    const navigate = useNavigate();

    const handleViewLocation = (batchID) => {
        navigate('/batch', { state: { batchID, type: 'BATCH' } });
    };

    const tableColumns = [
        {
            title: 'Mã lô',
            dataIndex: 'sbu',
            key: 'sbu',
        },
        {
            title: () => <TooltipTable text={'Ngày nhập'} textHover={'Click để sắp xếp ngày nhập'} />,
            dataIndex: 'importDate',
            key: 'importDate',
            defaultSortOrder: 'descend',
            sorter: (a, b) => new Date(a.importDate) - new Date(b.importDate),
        },
        {
            title: () => <TooltipTable text={'Ngày sản xuất'} textHover={'Click để sắp xếp ngày sản xuất'} />,
            dataIndex: 'macDate',
            key: 'macDate',
            defaultSortOrder: 'descend',
            sorter: (a, b) => new Date(a.macDate) - new Date(b.macDate),
        },
        {
            title: () => <TooltipTable text={'Hạn sử dụng'} textHover={'Click để sắp xếp hạn sử dụng'} />,
            dataIndex: 'expiredDate',
            key: 'expiredDate',
            defaultSortOrder: 'descend',
            sorter: (a, b) => new Date(a.expiredDate) - new Date(b.expiredDate),
        },
        {
            title: () => <TooltipTable text={'SL còn lại'} textHover={'Click để sắp xếp SL còn lại'} />,
            dataIndex: 'available',
            key: 'available',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.available - b.available,
            render: (text) => <p className={cx('number')}>{text}</p>,
        },
        {
            title: () => <TooltipTable text={'SL trong kho tạm'} textHover={'Click để sắp xếp SL trong kho tạm'} />,
            dataIndex: 'tempAmount',
            key: 'tempAmount',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.tempAmount - b.tempAmount,
            render: (text) => <p className={cx('number')}>{text}</p>,
        },
        {
            title: () => <TooltipTable text={'SL hợp lệ'} textHover={'Click để sắp xếp SL hợp lệ'} />,
            dataIndex: 'validAmount',
            key: 'validAmount',
            sorter: (a, b) => a.validAmount - b.validAmount,
            render: (text) => <p className={cx('number')}>{text}</p>,
        },
        {
            title: () => <TooltipTable text={'SL chờ xuất'} textHover={'Click để sắp xếp SL chờ xuất'} />,
            dataIndex: 'pendingOutAmount',
            key: 'pendingOutAmount',
            sorter: (a, b) => a.pendingOutAmount - b.pendingOutAmount,
            render: (text) => <p className={cx('number')}>{text}</p>,
        },
        {
            title: 'Đơn vị nhập',
            dataIndex: 'unit',
            key: 'unit',
            render: (text, record) => <p className={cx('number')}>{record.unit}</p>,
        },
        {
            title: 'Mã kho',
            dataIndex: 'wareId',
            key: 'wareId',
        },
        {
            title: 'Chi tiết',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        className={cx('btn-view-location')}
                        onClick={() => handleViewLocation(record.sbu)}
                        leftIcon={<Eye size={18} />}
                    ></Button>
                </div>
            ),
        },
    ];

    const handleOnChange = useCallback((page, pageSize) => {
        setCurrentPage(page);
    }, []);

    const handleCloseQRCodePreview = useCallback(() => {
        return setShowQRCode((prev) => !prev);
    }, []);

    const handleDownloadQRCode = () => {
        const a = document.createElement('a');
        a.href = qrCodeRef.current.src;
        a.download = `${Date.now()}-qrcode.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <>
            <Modal isOpenInfo={true} onClose={onClose}>
                <div
                    className={cx('wrapper-product-detail', {
                        [classname]: classname,
                    })}
                >
                    <div className={cx('header')}>
                        <h1>Chi tiết sản phẩm</h1>
                        <Button small primary leftIcon={<QrCode size={20} />} onClick={handleCloseQRCodePreview}>
                            <span>QR Code</span>
                        </Button>
                    </div>
                    <div className={cx('product-content')}>
                        <div className={cx('wrapper-image-product')}>
                            <Image
                                src={
                                    data?.image ||
                                    'https://marketplace.canva.com/EAFALM0AfOs/1/0/900w/canva-m%C3%A0u-n%C3%A2u-be-h%C3%ACnh-n%E1%BB%81n-%C4%91i%E1%BB%87n-tho%E1%BA%A1i-d%E1%BB%85-th%C6%B0%C6%A1ng-y%C3%AAu-%C4%91%E1%BB%9Di-iSucd-62myg.jpg'
                                }
                                alt="image-product"
                                classname={cx('image-product')}
                            />
                        </div>
                        <div className={cx('product-info')}>
                            <RowItem
                                firstTitle="Mã nhóm sản phẩm"
                                firstValue={data.skug}
                                secondTitle="Tên sản phẩm"
                                secondValue={data.productName}
                            />
                            <RowItem
                                firstTitle="Mã sản phẩm"
                                firstValue={data.sku}
                                secondTitle="Tổng lượng tồn kho"
                                secondValue={data?.amount || 0}
                            />
                            <RowItem firstTitle="Mô tả" firstValue={data.des} />
                            <RowItem firstTitle="Mã nhà cung cấp" firstValue={data.supplierId} />
                            <RowItem firstTitle="Đơn vị cơ bản" firstValue={data.baseUnitName} />
                        </div>
                    </div>
                    <div className={cx('batch')}>
                        <h2>Danh sách lô hàng</h2>
                        <MyTable
                            columns={tableColumns}
                            data={data.listBatch.length > 0 ? data.listBatch : []}
                            //className={cx('my-table')}
                            pagination
                            pageSize={3}
                            onChangePage={handleOnChange}
                            currentPage={currentPage}
                        />
                    </div>
                </div>
            </Modal>
            {showQRCode && (
                <Modal isOpenInfo={true} onClose={handleCloseQRCodePreview} showButtonClose={false}>
                    <div className={cx('wrapper-qrcode')}>
                        <h2>QRCode sản phẩm</h2>
                        <div className={cx('qrcode-preview')}>
                            <Image
                                ref={qrCodeRef}
                                classname={cx('qrcode')}
                                src={
                                    data.qrcode ||
                                    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/QR_Code_Example.svg/368px-QR_Code_Example.svg.png'
                                }
                            />
                        </div>
                        <div className={cx('action-qrcode')}>
                            <Button rounded medium success onClick={handleDownloadQRCode}>
                                <span>Tải xuống</span>
                            </Button>
                            <Button rounded medium primary onClick={handleCloseQRCodePreview}>
                                <span>Đóng</span>
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default ProductDetail;
