import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalReceiveProductMissingDetail.module.scss';
import Modal from '../Modal';
import toast from 'react-hot-toast';
import Button from '../Button';
import MyTable from '../MyTable';
import { authIsAdmin, convertDateVN } from '../../common';
import { formatStatusOrderPurchaseMissing, styleMessage } from '../../constants';
import parseToken from '../../utils/parseToken';
import request from '../../utils/httpRequest';
import PopupMessage from '../PopupMessage';
import CreateImportReceiptMissingDialog from '../../pages/ReceiveProductPage/CreateImportReceiptMissingDialog';
import Printer from '../Printer';
import { Printer as PrinterIcon, QrCode } from 'lucide-react';
import { QRCode } from 'antd';
import { useSelector } from 'react-redux';

const cx = classNames.bind(styles);

const ModalReceiveProductMissingDetail = ({ data, isOpen, onClose, reset }) => {
    const [showPopConfirmSaveMissing, setShowPopConfirmSaveMissing] = useState(false);
    const [showPurchaseSupplement, setShowPurchaseSupplement] = useState(false);
    const employee = useSelector((state) => state.AuthSlice.user);

    const handleUpdateStatus = async (status) => {
        try {
            const token = parseToken('tokenUser');
            const warehouse = parseToken('warehouse');
            const res = await request.post(
                '/api/order-purchase/update-status-order-purchase',
                {
                    orderPurchaseID: data.orderPurchaseID,
                    status,
                },
                {
                    headers: {
                        token: `Bearer ${token.accessToken}`,
                        employeeid: token.employeeID,
                        warehouseid: warehouse.warehouseID,
                    },
                },
            );
            console.log(res.data);
            toast.success('Cập nhật trạng thái thành công', styleMessage);
            //reset({ pageFilter: 1 });
            onClose(false);
        } catch (err) {
            toast.error('Cập nhật trạng thái thất bại', styleMessage);
            console.log(err);
            return;
        }
    };

    const columns = [
        {
            title: 'Mã CTDN',
            dataIndex: 'orderPurchaseDetailID',
            key: 'orderPurchaseDetailID',
            width: '12%',
        },
        {
            title: 'Mã lô',
            dataIndex: 'batchID',
            key: 'batchID',
            render: (text, record) => <span>{record.orderPurchaseDetail.batchID}</span>,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            render: (text, record) => <span>{record.orderPurchaseDetail.batch.product.productName}</span>,
        },
        {
            title: 'Đơn vị',
            dataIndex: 'unitName',
            key: 'unitName',
            render: (text, record) => <span>{record.orderPurchaseDetail.batch.unit.unitName}</span>,
        },
        {
            title: 'Số lượng yêu cầu',
            dataIndex: 'requestedQuantity',
            key: 'requestedQuantity',
            render: (text, record) => <span className={cx('num')}>{record.orderPurchaseDetail.requestedQuantity}</span>,
        },
        {
            title: 'Số lượng thiếu',
            dataIndex: 'missingQuantity',
            key: 'missingQuantity',
            render: (text, record) => <span className={cx('num')}>{record.missingQuantity}</span>,
        },
        {
            title: 'Mã lô hàng đề xuất nhập',
            width: '20%',
            dataIndex: 'batchID',
            key: 'batchID',
            render: (text, record) => <span>{record.batchID}</span>,
        },
    ];

    console.log('ppp', data);

    const renderPrinter = () => {
        return (
            <Printer
                buttonLabel="In phiếu"
                Icon={<PrinterIcon size={20} />}
                propsButton={{ outline: true, small: true }}
            >
                <div className={cx('wrapper-detail-import-product-content')}>
                    <p className={cx('title-header')}>Chi tiết lô hàng thiếu</p>
                    <div className={cx('info-container')}>
                        <div className={cx('info-row')}>
                            <div className={cx('info-item')}>
                                <label>Mã phiếu nhập</label>
                                <p>{data.orderPurchaseID}</p>
                            </div>
                            <div className={cx('info-item')}>
                                <label>Mã kho</label>
                                <p>{data?.orderPurchase?.warehouseID}</p>
                            </div>
                        </div>
                        <div className={cx('info-row')}>
                            <div className={cx('info-item')}>
                                <label>Mã nhân viên</label>
                                <p>{data?.orderPurchase?.employee.employeeID}</p>
                            </div>
                            <div className={cx('info-item')}>
                                <label>Ngày tạo</label>
                                <p>{data?.createdAt ? convertDateVN(data.createdAt) : ''}</p>
                            </div>
                        </div>
                        <div className={cx('info-row')}>
                            <div className={cx('info-item')}>
                                <label>Tên nhân viên</label>
                                <p>{data?.orderPurchase?.employee.employeeName}</p>
                            </div>
                            <div className={cx('info-item')}>
                                <label>Trạng thái</label>
                                <p>{formatStatusOrderPurchaseMissing[data?.status]}</p>
                            </div>
                        </div>
                    </div>

                    <div className={cx('suggest-location-view')}>
                        <p>Chi tiết đơn hàng thiếu</p>
                        <table className={cx('table')}>
                            <thead>
                                <tr>
                                    <th>Mã CTDN</th>
                                    <th>Mã lô</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Đơn vị</th>
                                    <th>SL yêu cầu</th>
                                    <th>SL thiếu</th>
                                    <th>Mã lô đề xuất</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.orderPurchaseMissingDetails?.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.orderPurchaseDetailID}</td>
                                        <td>{item.orderPurchaseDetail.batchID}</td>
                                        <td>{item.orderPurchaseDetail.batch.product.productName}</td>
                                        <td>{item.orderPurchaseDetail.batch.unit.unitName}</td>
                                        <td>{item.orderPurchaseDetail.requestedQuantity}</td>
                                        <td>{item.missingQuantity}</td>
                                        <td>{item.orderPurchaseDetail.batchID}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={cx('qr-code-section')}>
                        <p>QR Code Mã Phiếu Nhập Thiếu Của Lô Hàng</p>
                        <img src={data?.qrCode || ''} alt="qr-code-order-purchase-missing" />
                    </div>
                </div>
            </Printer>
        );
    };

    const renderPrinterBatchQRCode = (items) => {
        return (
            <Printer buttonLabel={'In mã lô'} Icon={<QrCode size={18} />} propsButton={{ outline: true, small: true }}>
                <div className={cx('layout-multiple-qrCode')}>
                    {items?.map(
                        (item, index) =>
                            item?.orderPurchaseDetail?.batch?.qrCode && (
                                <div key={index} className={cx('qr-item')}>
                                    <img src={item?.batch?.qrCode} alt={`QR Code ${item?.batchID}`} />
                                    <p>
                                        {item?.orderPurchaseDetail?.batch?.product?.productID}-
                                        {item?.orderPurchaseDetail?.batch?.product?.productName}
                                    </p>
                                    <p>Nhập bổ sung lô: {item?.batchID}</p>
                                </div>
                            ),
                    )}
                </div>
            </Printer>
        );
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('wrapper-detail-import-product-content')}>
                <p className={cx('title-header')}>Cập nhật chi tiết lô hàng</p>
                <div className={cx('row')}>
                    <div className={cx('column')}>
                        <div className={cx('form-group')}>
                            <label>Mã phiếu nhập</label>
                            <input value={data.orderPurchaseID} disabled type="text" />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Mã nhân viên</label>
                            <input value={data?.orderPurchase?.employee.employeeID} disabled type="text" />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Tên nhân viên</label>
                            <input value={data?.orderPurchase?.employee.employeeName} disabled type="text" />
                        </div>
                    </div>

                    <div className={cx('column')}>
                        <div className={cx('form-group')}>
                            <label>Mã kho</label>
                            <input type="text" disabled value={data?.orderPurchase?.warehouseID} />
                        </div>
                        {data?.status === 'PENDING' && (
                            <div className={cx('form-group')}>
                                <label>Ngày tạo</label>
                                <input
                                    value={data?.createdAt ? convertDateVN(data.createdAt) : ''}
                                    disabled
                                    type="datetime-local"
                                />
                            </div>
                        )}
                        {data?.status === 'CANCELED' && (
                            <div className={cx('form-status')}>
                                <div className={cx('form-group')}>
                                    <label>Trạng thái</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={formatStatusOrderPurchaseMissing[data?.status]}
                                    />
                                </div>
                                <div className={cx('row')}>
                                    <div className={cx('form-group')}>
                                        <label>Ngày tạo</label>
                                        <input
                                            value={data?.createdAt ? convertDateVN(data.createdAt) : ''}
                                            disabled
                                            type="datetime-local"
                                        />
                                    </div>
                                    <div className={cx('form-group')}>
                                        <label>Ngày huỷ</label>
                                        <input
                                            value={data?.createdAt ? convertDateVN(data.createdAt) : ''}
                                            disabled
                                            type="datetime-local"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {data?.status === 'RESOLVED' && (
                            <div className={cx('form-status')}>
                                <div className={cx('form-group')}>
                                    <label>Trạng thái</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={formatStatusOrderPurchaseMissing[data?.status]}
                                    />
                                </div>
                                <div className={cx('row')}>
                                    <div className={cx('form-group')}>
                                        <label>Ngày tạo</label>
                                        <input
                                            value={data?.createdAt ? convertDateVN(data.createdAt) : ''}
                                            disabled
                                            type="datetime-local"
                                        />
                                    </div>
                                    <div className={cx('form-group')}>
                                        <label>Ngày giải quyết</label>
                                        <input
                                            value={data?.createdAt ? convertDateVN(data.updatedAt) : ''}
                                            disabled
                                            type="datetime-local"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={cx('suggest-location-view')}>
                    <div className={cx('header-table')}>
                        <p>Chi tiết đơn hàng thiếu</p>
                        {renderPrinterBatchQRCode(data?.orderPurchaseMissingDetails)}
                    </div>
                    {/** render printer batch list qr */}
                    <MyTable columns={columns} data={data?.orderPurchaseMissingDetails} />
                </div>
                <div className={cx('action-modal')}>
                    {renderPrinter()}
                    {authIsAdmin(employee) && data?.status === 'PENDING' && (
                        <>
                            <Button success onClick={() => setShowPurchaseSupplement(true)}>
                                <span>Nhập bổ sung</span>
                            </Button>
                            <Button error onClick={() => setShowPopConfirmSaveMissing(true)}>
                                <span>Huỷ phiếu</span>
                            </Button>
                        </>
                    )}

                    <Button primary onClick={onClose}>
                        <span>Đóng</span>
                    </Button>
                </div>
            </div>

            <Modal
                isOpenInfo={showPopConfirmSaveMissing}
                onClose={() => setShowPopConfirmSaveMissing(false)}
                showButtonClose={false}
            >
                <div className={cx('wrapper-message')}>
                    <h1 className={cx('title')}>Thông báo</h1>
                    <p className={cx('des')}>Bạn có chắc chắn muốn hủy phiếu nhập thiếu này không?</p>
                    <div className={cx('action-confirm')}>
                        <Button
                            primary
                            onClick={() => {
                                handleUpdateStatus('CANCELED');
                            }}
                        >
                            <span>Có</span>
                        </Button>
                        <Button outline onClick={() => setShowPopConfirmSaveMissing(false)}>
                            <span>Không</span>
                        </Button>
                    </div>
                </div>
            </Modal>

            {showPurchaseSupplement && (
                <CreateImportReceiptMissingDialog
                    isOpen={showPurchaseSupplement}
                    onClose={() => {
                        onClose();
                        setShowPurchaseSupplement(false);
                    }}
                    orderPurchaseMissing={data}
                    handleFetchOrderMissing={() => {
                        reset({ pageFilter: 1 });
                    }}
                />
            )}
        </Modal>
    );
};

export default ModalReceiveProductMissingDetail;
