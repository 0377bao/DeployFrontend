import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './CategoryDialog.module.scss';
import { Button, Modal, MyTable } from '../../../components';
import { Input } from 'antd';
import { createCategoryProduct, getAllCategories, searchCategoryProduct } from '../../../services/category.service';
import { formatDate } from '../../../utils/formatDate';
import { generateCode } from '../../../utils/generate';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';

const cx = classNames.bind(styles);

const tableColumns = [
    {
        title: 'Mã nhóm sản phẩm',
        key: 'categoryID',
        dataIndex: 'categoryID',
    },
    {
        title: 'Tên nhóm sản phẩm',
        key: 'categoryName',
        dataIndex: 'categoryName',
    },
    {
        title: 'Ngày tạo',
        key: 'createdAt',
        dataIndex: 'createdAt',
        render: (text) => <p>{formatDate(text)}</p>,
    },
];

const { Search } = Input;

const CategoryDialog = ({ isOpen, onClose }) => {
    const [data, setData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const onChangePage = (page) => {
        setPage(page);
    };
    const [formData, setFormData] = useState({
        categoryID: '',
        categoryName: '',
    });

    const fetchCategories = async () => {
        try {
            const res = await getAllCategories(page);
            setData(res.data || []);
            setTotalPages(res?.pagination?.totalPages || 1);
            setPage(res?.pagination?.currentPage || 1);
        } catch (err) {
            console.log(err);
        }
    };

    const handleCreateCategory = async (formData) => {
        if (!formData.categoryID || !formData.categoryName) {
            toast.error('Vui lòng nhập đầy đủ thông tin', styleMessage);
            return;
        }
        if (!formData.categoryID) {
            toast.error('Vui lòng tạo mã nhóm sản phẩm', styleMessage);
            return;
        }
        if (!formData.categoryName) {
            toast.error('Vui lòng nhập tên nhóm sản phẩm', styleMessage);
            return;
        }

        try {
            const res = await createCategoryProduct({
                categoryID: formData.categoryID,
                categoryName: formData.categoryName,
            });
            if (res.status == 'OK') {
                setFormData({
                    categoryID: '',
                    categoryName: '',
                });
                fetchCategories(1);
            }
        } catch (err) {
            return;
        }
    };

    const onSearchCategory = async (keyword) => {
        try {
            if (!keyword) {
                fetchCategories(page);
                return;
            }
            const res = await searchCategoryProduct(keyword);
            if (!res.data) return;
            setData([res.data]);
            setPage(1);
            setTotalPages(1);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchCategories(page);
    }, [page]);

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose}>
            <div className={cx('wrapper-category-dialog')}>
                <h1 className={cx('category-create-title')}>Tạo nhóm sản phẩm</h1>
                <div className={cx('create-form')}>
                    <div className={cx('content')}>
                        <div className={cx('form-group')}>
                            <p className={cx('form-label')}>Mã nhóm</p>
                            <div className={cx('form-control')}>
                                <Input
                                    placeholder="Nhập tên nhóm sản phẩm"
                                    size={'large'}
                                    value={formData.categoryID}
                                />
                                <Button
                                    primary
                                    rounded
                                    medium
                                    onClick={() => setFormData((prev) => ({ ...prev, categoryID: generateCode('CA') }))}
                                    disabled={!!formData.categoryID}
                                >
                                    <span>Tạo mã</span>
                                </Button>
                            </div>
                        </div>
                        <div className={cx('form-group')}>
                            <p className={cx('form-label')}>Tên nhóm</p>
                            <Input
                                placeholder="Nhập tên nhóm sản phẩm"
                                size={'large'}
                                value={formData.categoryName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, categoryName: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className={cx('action-form')}>
                        <Button success medium onClick={() => handleCreateCategory(formData)}>
                            <span>Tạo nhóm</span>
                        </Button>
                        <Button
                            outline
                            medium
                            onClick={() =>
                                setFormData({
                                    categoryID: '',
                                    categoryName: '',
                                })
                            }
                        >
                            <span>Làm mới</span>
                        </Button>
                    </div>
                </div>

                <div className={cx('table-view')}>
                    <div className={cx('header-table')}>
                        <h2>Danh sách nhóm sản phẩm của kho</h2>
                        <div className={cx('input-search')}>
                            <Search
                                allowClear
                                placeholder="Nhập mã nhóm sản phẩm"
                                //enterButton="Tìm kiếm"
                                onSearch={onSearchCategory}
                                size="middle"
                            />
                        </div>
                    </div>

                    <MyTable
                        columns={tableColumns}
                        onChangePage={onChangePage}
                        pagination
                        pageSize={5}
                        currentPage={page}
                        total={totalPages * 5}
                        data={data}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default CategoryDialog;
