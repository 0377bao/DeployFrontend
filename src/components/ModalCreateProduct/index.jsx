import React, { useEffect, useState } from 'react'
import classNames from 'classnames/bind'
import styles from './ModalCreateProduct.module.scss'
import Modal from '../Modal'
import { CircleX } from 'lucide-react'
import { useForm } from 'react-hook-form'

const cx = classNames.bind(styles)

const ModalCreateProduct = ({ isOpen, onClose, title = "Tạo sản phẩm", defaultValue = {
    productID: "",
    productName: "",
    createAt: Date.now(),
    uom: "",
    uomOther: "",
    minStock: 1
}, type = "create", onSubmit }) => {
    const [showOtherUom, setShowOtherUom] = useState(false)
    const { register, formState: { errors }, handleSubmit } = useForm({
        defaultValues: defaultValue
    });
    const uom = form.watch('uom')
    useEffect(() => {
        if (uom) setShowOtherUom(true)
        else setShowOtherUom(false)
    }, [uom])
    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('wrapper-modal-create-account')}>
                <div className={cx('header-modal-create')}>
                    <p className={cx('title-modal')}>{title}</p>
                    <CircleX size={22} onClick={onClose} />
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className={cx('content')}>
                    <div className={cx('form-group')}>
                        <label className={cx('form-label')}>Mã sản phẩm</label>
                        <input type='text' placeholder='Nhập mã sản phẩm' className={cx("form-input")} {...register("productID", {
                            required: "Mã sản phẩm là bắt buộc",
                            pattern: {
                                value: /^[SP]\d{1,}$/,
                                message: 'Mã sản phẩm phải bắt đầu bằng SP và sau đó ít nhất 1 chữ số'
                            }
                        })} />
                        {errors.productID && <p className={cx('message-error')}>{errors.productID.message}</p>}
                    </div>
                    <div className={cx('form-group')}>
                        <label className={cx('form-label')}>Tên sản phẩm</label>
                        <input type='text' placeholder='Nhập tên sản phẩm' className={cx("form-input")} {...register("productName", {
                            required: 'Tên sản phẩm là bắt buộc',
                            pattern: {
                                value: /^[a-zA-Z ]+$/,
                                message: 'Tên sản phẩm chỉ chứa kí tự chữ và khoảng trắng'
                            }
                        })} />
                        {errors.productName && <p className={cx('message-error')}>{errors.productName.message}</p>}
                    </div>
                    <div className={cx('form-group')}>
                        <label className={cx('form-label')}>Ngày tạo</label>
                        <input type='date' placeholder='Nhập ngày tạo' className={cx("form-input")} {...register('createdAt', {
                            required: true
                        })} />
                    </div>
                    <div className={cx('form-group')}>
                        <select disabled={!showOtherUom} {...register("uom", {
                            required: 'Đơn vị tính là bắt buộc'
                        })}>
                            <option disabled>--Chọn đơn vị tính--</option>
                            <option>Cái</option>
                            <option>Hộp</option>
                            <option>Chai</option>
                            <option>Lon</option>
                            <option>Mục khác</option>
                        </select>
                    </div>

                    <div className={cx('form-group')}>
                        <label className={cx('form-label')}>Mục khác</label>
                        <input type='text' placeholder='Nhập đơn vị tính khác' className={cx("form-input")} />
                    </div>
                    <div className={cx('form-group')}>
                        <label className={cx('form-label')}>Tồn kho tối thiểu</label>
                        <input type='number' min="1" placeholder='Nhập số lượng tồn kho tối thiểu' className={cx("form-input")} {...register('minStock', {
                            required: 'Tồn kho tối thiểu là bắt buộc'
                        })} />
                        {errors.productName && <p className={cx('message-error')}>{errors.minStock.message}</p>}
                    </div>
                    <div className={cx('form-group')}>
                        <Button primary>
                            <span>{type === "create" ? "Tạo" : "Cập nhật"}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    )
}

export default ModalCreateProduct;