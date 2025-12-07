import React from 'react';
import classNames from 'classnames/bind';
import styles from './ModalUpdate.module.scss';
import { Modal, Button } from '@/components';
import { useForm } from 'react-hook-form';
const cx = classNames.bind(styles);

const ModalUpdate = ({ onClose, columns, label, onSubmit, defaultValue, type, showCancel=true }) => {
    const {register, formState: {errors}, handleSubmit } = useForm({
        defaultValues: {
            ...defaultValue
        }
    });
    return (
        <div className={cx('modal-content')}>
            <h2 className={cx('modal-title')}>{label}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className={cx('modal-form')}>
                {
                    columns.map((item) => (
                        <div className={cx('form-group')} key={item.id}>
                            <label htmlFor={item.id}>{item.label}</label>
                            {item.option && item.option.length > 0 ? <select {...register(item.name, {
                                required: `${item.label} không được để trống`
                            })}>
                                {item.option.map((op, idx) => <option key={idx} value={op.value}>{op.name}</option>)}
                            </select> :  <input
                                {...register(item.name, {
                                    required: `${item.label} không được để trống`,
                                    pattern: {
                                        value: item.pattern,
                                        message: item.message
                                    }
                                })}
                                type="text"
                                id={item.id}
                                className={cx('form-input')}
                                placeholder={`Nhập ${item.label}`} 
                                readOnly={item.readOnly} 
                            />}
                           
                            {errors[item.name] && <p className={cx('message-error')}>{errors[item.name].message}</p>}
                        </div>
                    ))
                }
                <div className={cx('form-actions')}>
                    <Button primary type="submit" className={cx('btn-submit')}>
                        {type == 'update' ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                    {showCancel && <Button primary type="button" className={cx('btn-cancel')} onClick={onClose}>
                        Hủy
                    </Button>}
                </div>
            </form>
        </div>
    );
};

export default ModalUpdate;
