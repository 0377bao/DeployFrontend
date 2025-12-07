import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalCreateAccount.module.scss';
import { Modal, Button } from '@/components';
import { useForm } from 'react-hook-form';
import { Eye, EyeClosed } from 'lucide-react';
import toast from 'react-hot-toast';
import { styleMessage } from '../../constants';

const cx = classNames.bind(styles);

const ModalCreateAccount = ({ isOpen, onClose, setAccount, setStatusCreateAccount }) => {
    const {
        register,
        formState: { errors },
        handleSubmit,
        watch,
        trigger,
    } = useForm({ mode: 'onTouched' });
    const formRef = useRef();
    const phaseContent = useRef();
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypedPassword, setShowRetypedPassword] = useState(false);

    const onSubmitForm = (data) => {
        const { email, password } = data;

        if (email && password) {
            // call api
            setAccount((prev) => ({ ...prev, email: email, password: password }));
            setStatusCreateAccount(true);
            toast.success('Tài khoản được tạo tạm thời và sẽ hoàn tất sau khi thêm nhân viên thành công', styleMessage);
            onClose();
        }
    };

    const handleScrollX = async (phase, stepIndex, fieldName) => {
        const stepWidth = 420;
        if ('back' === fieldName) {
            phase.current.style.transform = `translateX(${stepWidth * stepIndex}px)`;
        } else {
            const valid = await trigger(fieldName);
            if (!valid) return;
            phase.current.style.transform = `translateX(${stepWidth * stepIndex}px)`;
        }
    };

    const handleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleShowRetypedPassword = () => {
        setShowRetypedPassword((prev) => !prev);
    };

    const email = watch('email');
    const code = watch('code');
    const password = watch('password');

    return (
        <Modal
            isOpenInfo={isOpen}
            onClose={onClose}
            showButtonClose={false}
        >
            <form ref={formRef} onSubmit={handleSubmit(onSubmitForm)} className={cx('wrapper-modal-account')}>
                <div ref={phaseContent} className={cx('content')}>
                    <div className={cx('wrapper-email')}>
                        <h2>Nhập email đăng ký</h2>
                        <div className={cx('form-control')}>
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                {...register('email', {
                                    required: 'Vui lòng nhập email',
                                    pattern: {
                                        value: /^\w+@(gmail|yahoo)(.com|.com.vn)$/,
                                        message: 'Email không hợp lệ! Mẫu hợp lệ: abc@gmail.com',
                                    },
                                })}
                            />
                        </div>
                        {errors.email && <p className={cx('message-error')}>{errors.email.message}</p>}
                        <div className={cx('form-action')}>
                            <Button
                                  type="button"
                                  primary
                                  medium
                                  borderRadiusSmall
                                  onClick={() => {
                                      handleScrollX(phaseContent, -1, 'email');
                                  }}
                                  disabled={!email || errors.email}
                              >
                                  <span>Tiếp tục</span>
                              </Button>
                              <Button type="button"
                                  primary
                                  medium
                                  borderRadiusSmall
                                  onClick={onClose}
                                  >
                                <span>Đóng</span>
                              </Button>
                        </div>
                        
                    </div>
                    {/* <div className={cx('wrapper-verify-email')}>
                        <h2>Xác thực email</h2>
                        <p className={cx('des-email')}>Hệ thống đã gửi mã xác nhận đến email của bạn. Vui lòng nhập mã xác nhận vào bên dưới</p>
                        <input
                            type="text"
                            placeholder="Nhập mã xác thực"
                            {...register('code', {
                                required: 'Vui lòng nhập mã xác thực',
                                pattern: {
                                    value: /^\d{4}$/,
                                    message: 'Mã xác thực khồng hợp lệ',
                                },
                            })}
                        />
                        {errors.code && <p className={cx('message-error')}>{errors.code.message}</p>}
                        <div className={cx('footer-action')}>
                            <Button type="button" primary onClick={() => handleScrollX(phaseContent, 0, 'back')}>
                                <span>Quay lại</span>
                            </Button>
                            <Button type="button" primary onClick={() => handleScrollX(phaseContent, -2, 'code')} disabled={!code || errors.code}>
                                <span>Tiếp tục</span>
                            </Button>
                        </div>
                    </div> */}
                    <div className={cx('wrapper-password')}>
                        <div className={cx('form-group')}>
                            <label htmlFor="password">Nhập mật khẩu</label>
                            <div className={cx('form-control')}>
                                <input
                                    id="password"
                                    type={!showPassword ? 'password' : 'text'}
                                    placeholder="Nhập mật khẩu"
                                    {...register('password', {
                                        required: 'Vui lòng nhập mật khẩu',
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                                            message: 'Mật khẩu có cả chữ hoa, chữ thường, số và kí tự đặc biệt',
                                        },
                                        minLength: {
                                            value: 8,
                                            message: 'Mật khẩu có độ dài tối thiểu 8 kí tự',
                                        },
                                    })}
                                />
                                {showPassword && <Eye size={20} className={cx('icon')} onClick={handleShowPassword} />}
                                {!showPassword && (
                                    <EyeClosed size={20} className={cx('icon')} onClick={handleShowPassword} />
                                )}
                            </div>
                            {errors.password && <p className={cx('message-error')}>{errors.password.message}</p>}
                        </div>
                        <div className={cx('form-group')}>
                            <label>Xác nhận mật khẩu</label>
                            <div className={cx('form-control')}>
                                <input
                                    id="retypedPassword"
                                    type={!showRetypedPassword ? 'password' : 'text'}
                                    placeholder="Nhập lại mật khẩu"
                                    {...register('retypedPassword', {
                                        required: 'Vui lòng nhập mật khẩu',
                                        validate: (value) => {
                                            return password === value || 'Xác nhận mật khẩu không khớp';
                                        },
                                    })}
                                />
                                {showRetypedPassword && (
                                    <Eye size={20} className={cx('icon')} onClick={handleShowRetypedPassword} />
                                )}
                                {!showRetypedPassword && (
                                    <EyeClosed size={20} className={cx('icon')} onClick={handleShowRetypedPassword} />
                                )}
                            </div>
                            {errors.retypedPassword && (
                                <p className={cx('message-error')}>{errors.retypedPassword.message}</p>
                            )}
                        </div>
                        <div className={cx('footer-action')}>
                            <Button type="button" primary medium borderRadiusSmall onClick={() => handleScrollX(phaseContent, 0, 'back')}>
                                <span>Quay lại</span>
                            </Button>
                            <Button type="submit" primary medium borderRadiusSmall>
                                  <span>Tạo</span>
                              </Button>
                              <Button type="button" primary medium borderRadiusSmall onClick={onClose}>
                                  <span>Đóng</span>
                              </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default ModalCreateAccount;
