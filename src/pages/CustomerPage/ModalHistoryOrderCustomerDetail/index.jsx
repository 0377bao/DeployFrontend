import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalHistoryOrderCustomerDetail.module.scss';
import { Modal } from '../../../components';
import { formatDate } from '../../../utils/formatDate';

const cx = classNames.bind(styles);

const ModalHistoryOrderCustomerDetail = ({ isOpen, onClose, initialData }) => {
    const [historyDetail, setHistoryDetail] = useState([]);
    const initialDataRef = useRef();
    const totalProduct = useRef();
    const totalAmount = useRef();
    const [search, setSearch] = useState(null);

    const handleFilter = useCallback((search) => {
        if (!search) {
            setHistoryDetail(initialDataRef.current);
            return;
        }
        const dataFilter = initialDataRef.current.filter(
            (it) => it.productID == search.trim() || it.batchID == search.trim(),
        );

        setHistoryDetail(dataFilter);
    }, []);

    useEffect(() => {
        if (!initialData) return;
        const productSet = new Set();
        const dataRender = initialData.orderReleaseDetails.map((it) => {
            productSet.add(it?.batch?.productID);
            return {
                batchID: it?.batchID || '',
                productID: it?.batch?.productID || '',
                productName: it?.batch?.product?.productName || '',
            };
        });

        initialDataRef.current = dataRender; // lưu giá trị ban đầu
        totalAmount.current = dataRender.length || 0;
        totalProduct.current = productSet.size || 0;

        setHistoryDetail(dataRender);
    }, [initialData]);

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose}>
            <div className={cx('wrapper-history-order-detail')}>
                <h1 className={cx('title')}>Chi tiết giao dịch</h1>
                <div className={cx('card')}>
                    <div className={cx('section')}>
                        <div className={cx('section-title')}>Thông tin chung</div>
                        <div className={cx('row')}>
                            <div className={cx('field')}>
                                <label>Mã phiếu</label>
                                <input type="text" value={initialData?.orderReleaseID || ''} readOnly />
                            </div>
                            <div className={cx('field')}>
                                <label>Ngày tạo phiếu</label>
                                <input type="text" value={formatDate(initialData?.createdAt) || ''} readOnly />
                            </div>
                            <div className={cx('field')}>
                                <label>Kho xuất</label>
                                <input type="text" value={initialData?.warehouses?.warehouseName || ''} readOnly />
                            </div>
                        </div>
                        <div className={cx('row')}>
                            <div className={cx('field')}>
                                <label>Người lập phiếu</label>
                                <input type="text" value={initialData?.employees?.employeeName} readOnly />
                            </div>
                            <div className={cx('field')}>
                                <label>Mã khách hàng</label>
                                <input
                                    type="text"
                                    placeholder="Nhập mã khách hàng"
                                    value={initialData?.customers?.customerID}
                                    readOnly
                                />
                            </div>
                            <div className={cx('field')}>
                                <label>Tên khách hàng</label>
                                <input
                                    type="text"
                                    placeholder="Tên khách hàng"
                                    value={initialData?.customers?.customerName}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                    <div className={cx('section')}>
                        <div className={cx('section-title')}>Danh sách hàng hóa đề xuất xuất</div>
                        <div className={cx('search-row')}>
                            <input
                                className={cx('search-input')}
                                placeholder="Nhập mã sản phẩm hoặc mã lô"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button className={cx('btn-search')} onClick={() => handleFilter(search)}>
                                Tìm kiếm
                            </button>
                        </div>
                        <div className={cx('table-wrap')}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Mã lô</th>
                                        <th>Mã SP</th>
                                        <th>Tên SP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyDetail.map((it, index) => (
                                        <tr>
                                            <td className={cx('cell-number')}>{index + 1}</td>
                                            <td className={cx('cell-text')}>{it.batchID}</td>
                                            <td className={cx('cell-text')}>{it.productID}</td>
                                            <td className={cx('cell-text')}>{it.productName}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className={cx('summary-row')}>
                            <span>
                                Số mặt hàng: <b>{totalProduct.current}</b>
                            </span>
                            <span>
                                Tổng số lượng: <b>{totalAmount.current}</b>
                            </span>
                        </div>
                    </div>
                </div>
                <div className={cx('footer')}>© 2025 Kho Hàng • Phiếu đề xuất xuất kho</div>
            </div>
        </Modal>
    );
};

export default ModalHistoryOrderCustomerDetail;
