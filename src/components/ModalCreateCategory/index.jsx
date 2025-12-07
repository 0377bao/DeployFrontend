import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalCreateCategory.module.scss';
import { Button, Modal } from '@/components';
import md5 from 'md5';
import { useForm } from 'react-hook-form';

const cx = classNames.bind(styles);

const ModalCreateCategory = ({onClose, handleCreate}) => {
    const {register, setValue, handleSubmit, formState: {errors}} = useForm();

    const handleGenerateCategoryCode = () => {
        const code = md5(Date.now()).slice(-5)
        return `CA${code}`
    }

    return (
        <Modal showButtonClose={false} isOpenInfo={true} onClose={onClose}>
            <form onSubmit={handleSubmit(handleCreate)} className={cx('wrapper-modal-create-category')}>
            <div className={cx('form-group')}>
                <label>Mã nhóm sản phẩm</label>
                <input type="text" placeholder="Mã nhóm sản phẩm" readOnly {...register("categoryID", {required: "Mã nhóm sản phẩm không được để trống"})}/>
                <Button type="button" primary onClick={() => setValue("categoryID", handleGenerateCategoryCode())}>
                    <span>Tạo mã</span>
                </Button>
            </div>
            {errors.categoryId && <p className={cx("message-error")}>{errors.categoryId.message}</p>}
            <div className={cx('form-group')}>
                <label>Tên nhóm sản phẩm</label>
                <input type="text" placeholder="Nhập tên nhóm sản phẩm" {...register("categoryName", {
                    required: 'Tên nhóm sản phẩm không được để trống'
                })}/>
            </div>
            {errors.categoryName && <p className={cx("message-error")}>{errors.categoryName.message}</p>}
            {/* <div className={cx('form-group')}>
                <label>Chọn kho</label>
                <select defaultValue={""} {...register('warehouseId', {
                    required: "Kho không được để trống"
                })}>
                    <option value={""} disabled></option>
                    <option value={'WH01'}>Kho A chi nhánh hà nội</option>
                    <option value={'WH02'}>Kho B chi nhánh bắc giang</option>
                </select>
            </div>
            {errors.warehouseId && <p className={cx("message-error")}>{errors.warehouseId.message}</p>}
            <div className={cx('form-group')}>
                <label>Chọn khu vực</label>
                <select defaultValue={""} {...register("locationId", {
                    required: 'Khu vực không được để trống'
                })}>
                    <option value={""} disabled></option>
                    <option value={'A01'}>A</option>
                    <option value={'B01'}>B</option>
                </select>
            </div>
            {errors.locationId && <p className={cx("message-error")}>{errors.locationId.message}</p>} */}
            <div className={cx('btn-create-category')}>
                <Button type="submit" primary>
                    <span>Tạo</span>
                </Button>
                 <Button type="button" primary onClick={onClose}>
                    <span>Huỷ</span>
                </Button>
            </div>
        </form>
        </Modal>
        
    );
};

export default ModalCreateCategory;
