import { Button, Modal, MyTable } from '../../../components';
import { Pagination, QRCode } from 'antd';
import classNames from 'classnames/bind';
import styles from './BoxDetail.module.scss';
import { useEffect, useState } from 'react';
import { getBoxDetails } from '../../../services/box.service';
import parseToken from '../../../utils/parseToken';
import { convertDateVN } from '@/common';
import { getBatchesWithoutLocation } from '../../../services/batch.service';
import { MapPinPen, MoveIcon, QrCode } from 'lucide-react';
import Tippy from '@tippyjs/react';
import { authIsAdmin } from '../../../common';
import { useSelector } from 'react-redux';

const cx = classNames.bind(styles);

const BoxDetail = ({ isOpen, onClose, boxID, setShowUpdateLocation, setShowChangeLocation, setBatchesUpdate }) => {
    const [batchID, setBatchID] = useState('');
    const [productID, setProductID] = useState('');
    const [boxDetail, setBoxDetail] = useState({});
    const [batches, setBatches] = useState([]);
    const [batchesWithoutLocation, setBatchesWithoutLocation] = useState([]);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedBatchQR, setSelectedBatchQR] = useState(null);
    const currentUser = useSelector((state) => state.AuthSlice.user);

    const handleSelectAllChange = () => {
        if (selectAll) {
            // nếu đang chọn tất cả thì bỏ hết
            setSelectedBatches([]);
            setSelectAll(false);
        } else {
            // nếu chưa chọn hết thì chọn toàn bộ batch trong bảng hiện tại
            setSelectedBatches(batches);
            setSelectAll(true);
        }
    };

    const handleCheckboxChange = (batch) => {
        setSelectedBatches((prev) => {
            let updated;
            if (prev.some((item) => item.batchID === batch.batchID)) {
                // bỏ batch ra
                updated = prev.filter((item) => item.batchID !== batch.batchID);
            } else {
                // thêm batch vào
                updated = [...prev, batch];
            }

            // cập nhật lại trạng thái checkbox tổng
            setSelectAll(updated.length === batches.length);

            return updated;
        });
    };

    useEffect(() => {
        if (isOpen && boxID) {
            // fetch box details
            const fetchBoxDetails = async () => {
                const warehouse = parseToken('warehouse');
                const warehouseID = warehouse.warehouseID;
                const res = await getBoxDetails(warehouseID, boxID);
                if (res) {
                    setBoxDetail(res.data.data);
                    setBatches(res.data.data.batches);
                }
            };
            fetchBoxDetails();
        } else if (isOpen && !boxID) {
            const fetchBatchesWithoutLocation = async () => {
                const warehouse = parseToken('warehouse');
                const warehouseID = warehouse.warehouseID;
                const res = await getBatchesWithoutLocation(warehouseID, currentPage);
                console.log(res.data.data);
                if (res) {
                    setBatchesWithoutLocation(res.data.data);
                    setBatches(res.data.data);
                    setTotalPages(res.data.totalPages);
                }
            };
            fetchBatchesWithoutLocation();
        }
    }, [isOpen, boxID, currentPage]);

    const handleCLoseModel = () => {
        setBatchID('');
        setProductID('');
        setBoxDetail({});
        setBatches([]);
        onClose();
        setSelectedBatches([]);
        setSelectAll(false);
        setCurrentPage(1);
    };

    const handleSearch = () => {
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        if (boxID) {
            const filteredBatches = boxDetail.batches.filter((batch) => {
                const batchIdMatch = new RegExp(escapeRegex(batchID), 'i').test(batch.batchID ?? '');
                const productIdMatch = new RegExp(escapeRegex(productID), 'i').test(batch.product?.productID ?? '');
                return batchIdMatch && productIdMatch;
            });
            setBatches(filteredBatches);
        } else {
            const filteredBatches = batchesWithoutLocation.filter((batch) => {
                const batchIdMatch = new RegExp(escapeRegex(batchID), 'i').test(batch.batchID ?? '');
                const productIdMatch = new RegExp(escapeRegex(productID), 'i').test(batch.product?.productID ?? '');
                return batchIdMatch && productIdMatch;
            });
            setBatches(filteredBatches);
        }
        setSelectedBatches([]);
        setSelectAll(false);
    };

    const handleReset = () => {
        setBatchID('');
        setProductID('');
        if (!boxID) {
            setBatches(batchesWithoutLocation);
        } else {
            setBatches(boxDetail.batches);
        }
        setSelectedBatches([]);
        setSelectAll(false);
    };

    const handleUpdateLocation = () => {
        if (boxID) {
            const location =
                boxDetail?.boxName + ' - ' + boxDetail?.floor?.floorName + ' - ' + boxDetail?.floor?.shelf?.shelfName;
            setBatchesUpdate({
                boxID: boxID,
                batches: selectedBatches,
                location,
            });
            setShowChangeLocation(true);
        } else {
            // chuyển vị trí kho tạm
            setBatchesUpdate(selectedBatches);
            setShowUpdateLocation(true);
        }
        handleCLoseModel();
    };

    const onChangePage = (page) => {
        setCurrentPage(page);
    };

    const handleShowQR = (batch) => {
        setSelectedBatchQR(batch);
    };

    const handleCloseQR = () => {
        setSelectedBatchQR(null);
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={handleCLoseModel} showButtonClose={false}>
            {boxID && (
                <section className={cx('card')}>
                    <h2 className={cx('cardTitle')}>Thông tin chung</h2>
                    <div className={cx('infoWrapper')}>
                        <div className={cx('grid3', 'infoFields')}>
                            <div className={cx('field')}>
                                <label>Vị trí</label>
                                <input
                                    readOnly={true}
                                    value={
                                        boxDetail?.boxName +
                                        ' - ' +
                                        boxDetail?.floor?.floorName +
                                        ' - ' +
                                        boxDetail?.floor?.shelf?.shelfName
                                    }
                                />
                            </div>
                            <div className={cx('field')}>
                                <label>Chiều rộng</label>
                                <input type="text" readOnly value={boxDetail?.width} />
                            </div>
                            <div className={cx('field')}>
                                <label>Chiều dài</label>
                                <input value={boxDetail?.length} readOnly />
                            </div>
                            <div className={cx('field')}>
                                <label>Chiều cao</label>
                                <input readOnly value={10} />
                            </div>
                            <div className={cx('field')}>
                                <label>Tổng thể tích</label>
                                <input readOnly value={boxDetail?.maxAcreage} />
                            </div>
                            <div className={cx('field')}>
                                <label>Thể tích còn lại</label>
                                <input readOnly value={boxDetail?.remainingAcreage} />
                            </div>
                        </div>
                        <div className={cx('qrCodeWrapper')}>
                            <QRCode value={boxID || 'N/A'} size={150} />
                            <span className={cx('qrNote')}>{boxID}</span>
                        </div>
                    </div>
                </section>
            )}
            <section className={cx('card', 'box-detail')}>
                <div className={cx('box-detail-filter')}>
                    <div className={cx('form-group')}>
                        <label htmlFor="batchID">Mã lô</label>
                        <input
                            type={'text'}
                            className={cx('form-input')}
                            placeholder={`Nhập mã lô cần tìm`}
                            id="batchID"
                            value={batchID}
                            onChange={(e) => setBatchID(e.target.value)}
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="productID">Mã sản phẩm</label>
                        <input
                            type={'text'}
                            className={cx('form-input')}
                            placeholder={`Nhập mã sản phẩm cần tìm`}
                            id="productID"
                            value={productID}
                            onChange={(e) => setProductID(e.target.value)}
                        />
                    </div>
                </div>
                <div className={cx('form-actions')}>
                    <Button primary className={cx('btn-search')} onClick={handleSearch}>
                        Tìm kiếm
                    </Button>
                    <Button primary className={cx('btn-search')} onClick={handleReset}>
                        Đặt lại
                    </Button>
                    {authIsAdmin(currentUser) && (
                        <Button
                            disabled={
                                selectedBatches.length === 0 ||
                                (boxID && selectedBatches.some((batch) => batch.batch_boxes.validQuantity === 0))
                            }
                            primary
                            className={cx('btn-search')}
                            onClick={handleUpdateLocation}
                        >
                            {!boxID ? 'Cập nhật vị trí' : 'Chuyển vị trí'}
                        </Button>
                    )}
                </div>
                {boxID && <h4 className={cx('box-detail-content')}>Nội dung chi tiết ô</h4>}
                {!boxID && <h4 className={cx('box-detail-content')}>Danh sách sản phẩm trong kho tạm</h4>}
                <div className={cx(['tableWrap', !boxID && 'tableWrapNoBox'])}>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                {authIsAdmin(currentUser) && (
                                    <th>
                                        <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} />
                                    </th>
                                )}
                                <th className={cx('stt')}>Mã lô</th>
                                <th className={cx('productID')}>Mã sản phẩm</th>
                                <th className={cx('productName')}>Tên sản phẩm</th>
                                <th className={cx('unit')}>Đơn vị tính</th>
                                <th className={cx('num')}>Tổng số lượng</th>
                                {boxID && (
                                    <>
                                        <th className={cx('num')}>SL khả dụng</th>
                                        <th className={cx('num')}>SL chờ xuất</th>
                                    </>
                                )}
                                <th className={cx('note')}>Ngày sản xuất</th>
                                <th className={cx('note')}>Ngày hết hạn</th>
                                <th className={cx('action')}>Mã QR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* only chose batches with batch.batch_boxes?.quantity > 0 */}
                            {batches
                                ?.filter((batch) => batch.batch_boxes?.quantity > 0 || !boxID)
                                .map((batch, index) => (
                                    <tr key={index}>
                                        {authIsAdmin(currentUser) && (
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBatches
                                                        .map((item) => item.batchID)
                                                        .includes(batch.batchID)}
                                                    onChange={() => handleCheckboxChange(batch)}
                                                />
                                            </td>
                                        )}
                                        <td className={cx('stt')}>{batch.batchID}</td>
                                        <td className={cx('productID')}>{batch.product.productID}</td>
                                        <td className={cx('productName')}>{batch.product.productName}</td>
                                        <td className={cx('unit')}>{batch.unit.unitName}</td>
                                        <td className={cx('num')}>
                                            {boxID ? batch.batch_boxes?.quantity : batch.remainAmount}
                                        </td>
                                        {boxID && (
                                            <>
                                                <td className={cx('num')}>
                                                    {boxID ? batch.batch_boxes?.validQuantity : '-'}
                                                </td>
                                                <td className={cx('num')}>
                                                    {boxID ? batch.batch_boxes?.pendingOutQuantity : '-'}
                                                </td>
                                            </>
                                        )}
                                        <td className={cx('note')}>{convertDateVN(batch.manufactureDate)}</td>
                                        <td className={cx('note')}>{convertDateVN(batch.expiryDate)}</td>
                                        <td className={cx('action')}>
                                            <button className={cx('iconBtn')} onClick={() => handleShowQR(batch)}>
                                                <QrCode size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                {!boxID && (
                    <div className={cx('pagination')}>
                        <Pagination
                            current={currentPage}
                            total={totalPages * 5}
                            pageSize={5}
                            onChange={onChangePage}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </section>
            {selectedBatchQR && <QRModal isOpen={!!selectedBatchQR} onClose={handleCloseQR} batch={selectedBatchQR} />}
        </Modal>
    );
};

const QRModal = ({ isOpen, onClose, batch }) => {
    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('qrCodeWrapper')}>
                <h3 className={cx('cardTitle')} style={{ marginBottom: 16 }}>
                    Mã QR Lô hàng
                </h3>
                <QRCode value={batch?.batchID || 'N/A'} size={200} />
                <span className={cx('qrNote')}>{batch?.batchID}</span>
                <div style={{ marginTop: 8, color: '#666' }}>{batch?.product?.productName}</div>
            </div>
        </Modal>
    );
};

export default BoxDetail;
