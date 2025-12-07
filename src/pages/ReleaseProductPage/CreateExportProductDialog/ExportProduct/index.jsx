import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ExportProduct.module.scss';
const cx = classNames.bind(styles);

// danh sách sản phẩm được chọn để export
const ExportProduct = ({ productListResult, className }) => {
    const [productList, setProductList] = useState(productListResult || []);

    useEffect(() => {
        setProductList(productListResult || []);
    }, [productListResult]);

    return (
        <>
            <section className={cx('table-product-release', className)}>
                <h2 className={cx('table-header')}>Danh sách sản phẩm xuất kho</h2>
                <div className={cx('tableWrap')}>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th className={cx('stt')}>STT</th>
                                <th className={cx('productID')}>Mã sản phẩm</th>
                                <th className={cx('productName')}>Tên sản phẩm</th>
                                <th className={cx('action')}>Đơn vị xuất</th>
                                <th className={cx('action')}>Số lượng xuất</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productList?.length > 0 ? (
                                productList.map((item, index) => (
                                    <tr key={index}>
                                        <td className={cx('stt')}>{index + 1}</td>
                                        <td className={cx('productID')}>{item.productID}</td>
                                        <td className={cx('productName')}>{item.productName}</td>
                                        <td className={cx('action')}>{item.unit?.unitName}</td>
                                        <td className={cx('number')}>{item.amountRequiredExport}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                                        Không có sản phẩm nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
};

export default ExportProduct;
