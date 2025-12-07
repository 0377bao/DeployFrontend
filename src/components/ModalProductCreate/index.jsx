import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalProductCreate.module.scss';
import Modal from '../Modal';
import Button from '../Button';
import toast from 'react-hot-toast';
import { styleMessage } from '../../constants';
import { createProduct } from '../../services/product.service';
import noUser from '../../assets/no_image.jpg';
import Image from '../Image';
import { getAllCategories, getAllCategoriesForCreateProduct } from '../../services/category.service';
import { getAllBaseUnitsProduct } from '../../services/baseUnitProduct.service';

const cx = classNames.bind(styles);

const ModalProductCreate = ({ isOpen, onClose, prefectProductList }) => {
    const imageRef = useRef(null);
    const [formData, setFormData] = useState({
        categoryID: '',
        productID: '',
        productName: '',
        baseUnitProductID: '',
        minStock: 1,
        status: 'Đang kinh doanh',
        image: '',
        description: '',
    });
    const [categories, setCategories] = useState([]);
    const [baseUnits, setBaseUnits] = useState([]);

    useEffect(() => {
        // fetchCategories
        async function fetchCategories() {
            try {
                const res = await getAllCategoriesForCreateProduct();
                const updateCategory = [
                    { value: '', label: 'Chọn mã nhóm sản phẩm' },
                    ...(res?.data || []).map((category) => ({
                        value: category.categoryID,
                        label: category.categoryName,
                    })),
                ];
                setCategories(updateCategory);
            } catch (err) {
                console.log(err);
            }
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        // fetch baseUnits
        async function fetchBaseUnitsProduct() {
            try {
                const res = await getAllBaseUnitsProduct();
                const updateBaseUnit = [
                    { value: '', label: 'Chọn đơn vị cơ bản' },
                    ...(res?.data || []).map((item) => ({
                        value: item.baseUnitProductID,
                        label: item.baseUnitName,
                    })),
                ];
                setBaseUnits(updateBaseUnit);
            } catch (err) {
                console.log(err);
            }
        }
        fetchBaseUnitsProduct();
    }, []);

    // Options cho select
    // const unitOptions = [
    //     { value: '', label: 'Chọn đơn vị cơ bản' },
    //     { value: 'UOM1', label: 'Lon' },
    //     { value: 'UOM2', label: 'Hộp' },
    //     { value: 'UOM3', label: 'Bịch' },
    //     { value: 'UOM4', label: 'Chai' },
    // ];

    // categrory options
    // const categoryOptions = [
    //     { value: '', label: 'Chọn mã nhóm sản phẩm' },
    //     { value: 'CA1', label: 'Sữa bột' },
    //     { value: 'CA2', label: 'Sữa đặc' },
    //     { value: 'CA3', label: 'Sữa tươi' },
    //     { value: 'CA4', label: 'Sữa hộp' },
    // ];

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.categoryID) {
            toast.error('Vui lòng chọn mã nhóm sản phẩm', styleMessage);
            return;
        }

        if (!formData.productID.trim()) {
            toast.error('Vui lòng nhập mã sản phẩm', styleMessage);
            return;
        }

        if (!formData.productName.trim()) {
            toast.error('Vui lòng nhập tên sản phẩm', styleMessage);
            return;
        }

        if (!formData.baseUnitProductID) {
            toast.error('Vui lòng chọn đơn vị cơ bản', styleMessage);
            return;
        }

        if (!formData.minStock) {
            toast.error('Vui lòng nhập số lượng tối thiểu', styleMessage);
            return;
        }

        if (!formData.image) {
            toast.error('Vui lòng chọn ảnh cho sản phẩm', styleMessage);
            return;
        }

        // call api
        try {
            const res = await createProduct({
                ...formData,
                amount: 0,
                price: Math.floor(Math.random() * 100000),
                status: 'AVAILABLE',
            });
            if (res?.data?.status === 'OK') toast.success('Tạo sản phẩm thành công', styleMessage);
            else return;
            console.log(res);
        } catch (err) {
            console.log(err);
            return;
        }

        // Reset form
        setFormData({
            categoryID: '',
            productID: '',
            productName: '',
            baseUnitProductID: '',
            minStock: 1,
            status: 'Đang kinh doanh',
            image: '',
        });

        onClose();
        prefectProductList();
    };

    const handleCancel = () => {
        // Reset form khi hủy
        setFormData({
            categoryID: '',
            productID: '',
            productName: '',
            baseUnitName: '',
            minStock: 1,
            status: 'Đang kinh doanh',
            image: '',
        });
        onClose();
    };

    const handlePreviewImage = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => {
            const url = reader.result;
            setFormData((prev) => ({ ...prev, image: url }));
        };
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={handleCancel} showButtonClose={false}>
            <div className={cx('wrapper')}>
                <div className={cx('header')}>
                    <h2 className={cx('title')}>Thêm mới sản phẩm</h2>
                </div>

                <div className={cx('body-create-product')}>
                    <div className={cx('image-section')}>
                        <Image
                            className={cx('image-upload')}
                            src={formData.image === '' ? noUser : formData.image}
                            alt={'image-employee'}
                        />
                        <input ref={imageRef} type="file" hidden onChange={handlePreviewImage} />

                        <Button className={cx('btn-upload')} primary onClick={() => imageRef.current.click()}>
                            <span>Tải ảnh lên</span>
                        </Button>
                    </div>
                    <div className={cx('form-content')}>
                        <div className={cx('form-group')}>
                            <label className={cx('label', 'required')}>Mã nhóm sản phẩm</label>
                            <select
                                value={formData.categoryID}
                                onChange={(e) => handleInputChange('categoryID', e.target.value)}
                                className={cx('select-field')}
                            >
                                {categories.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={cx('form-group')}>
                            <label className={cx('label', 'required')}>Mã sản phẩm</label>
                            <input
                                type="text"
                                placeholder="Nhập Mã sản phẩm"
                                value={formData.productID}
                                onChange={(e) => handleInputChange('productID', e.target.value)}
                                className={cx('input-field')}
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label className={cx('label', 'required')}>Tên sản phẩm</label>
                            <input
                                type="text"
                                placeholder="Nhập Tên sản phẩm"
                                value={formData.productName}
                                onChange={(e) => handleInputChange('productName', e.target.value)}
                                className={cx('input-field')}
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label className={cx('label')}>Mô tả sản phẩm</label>
                            <input
                                type="text"
                                placeholder="Nhập mô tả sản phẩm"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className={cx('input-field')}
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label className={cx('label', 'required')}>Đơn vị cơ bản</label>
                            <select
                                value={formData.baseUnitProductID}
                                onChange={(e) => handleInputChange('baseUnitProductID', e.target.value)}
                                className={cx('select-field')}
                            >
                                {baseUnits.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={cx('form-group')}>
                            <label className={cx('label')}>Số lượng tồn tối thiểu</label>
                            <input
                                type="number"
                                placeholder="Nhập Số lượng tồn tối thiểu"
                                value={formData.minStock}
                                min={1}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val < 0) return;
                                    handleInputChange('minStock', val);
                                }}
                                className={cx('input-field')}
                                onKeyDown={(e) => {
                                    if (e.key === '-') {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label className={cx('label')}>Trạng thái</label>
                            <input
                                type="text"
                                readOnly
                                placeholder="Nhập Trạng thái"
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                className={cx('input-field')}
                            />
                        </div>
                    </div>
                </div>

                <div className={cx('footer')}>
                    <Button outline medium onClick={handleCancel} className={cx('btn-cancel')}>
                        <span>Hủy</span>
                    </Button>
                    <Button primary medium onClick={handleSubmit} className={cx('btn-submit')}>
                        <span>Tạo mới</span>
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ModalProductCreate;
