import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ProductEdit.module.scss';
import Modal from '../Modal';
import Button from '../Button';
import toast from "react-hot-toast"
import {ModalUpdate} from "@/components"

const cx = classNames.bind(styles);


const ProductEdit = ({ data, onClose, handleUpdateProduct }) => {
    const [productData, setProductData] = useState({
        productName: data.productName,
        productStatus: data.status,
        productMinStock: data.minStock
    })

    const columns = [
    {
        id:1,
        label: 'Tên sản phẩm',
        name: 'productName',
        value: productData.productName,
        setValue: (value) => setProductData(prev => ({...prev, productName: value}))
    },
    {
        id: 2, 
        label: 'Tồn kho tối thiểu',
        name: 'productMinStock',
        value: productData.productMinStock,
        pattern: /^\d{1,}/,
        message: 'Tồn kho tối thiểu phải là số nguyên',
        setValue: (value) => setProductData(prev => ({...prev, productMinStock: value}))
    },
     {
        id: 3,
        label: 'Trạng thái',
        name: 'productStatus',
        value: productData.productStatus,
        option: [
            {
                name: "Đang kinh doanh",
                value: 'AVAILABLE'
            },
            {
                name: 'Hàng trong kho đã hết',
                value: 'OUT_OF_STOCK'
            },
            {
                name: 'Ngừng kinh doanh',
                value: 'DISCONTINUED'
            }
        ],
        setValue: (value) => setProductData(prev => ({...prev, productStatus: value}))
    },
    ]

    return (
        <Modal showButtonClose={false} isOpenInfo={true} onClose={onClose}>
            <ModalUpdate label={"Cập nhật sản phẩm"} columns={columns} onSubmit={handleUpdateProduct} onClose={onClose} defaultValue={productData} type={"update"}/>
        </Modal>
        
    );
};

export default ProductEdit;
