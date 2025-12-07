import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Register.module.scss';
import Button from '@/components/Button';
import { Eye, EyeClosed, Mail } from 'lucide-react';
import logo from '@/assets/logo_v2.jpg';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { get } from '@/utils/httpRequest';
import { useNavigate } from 'react-router-dom';
import { styleMessage } from '../../constants';

const cx = classNames.bind(styles);
const softwareName = import.meta.env.VITE_SOFTWARE_NAME;

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypedPassword, setShowRetypedPassword] = useState(false);
    // react-hook-form trả về những biến này
    // register -> đăng ký các biến input cho hook-form quản quản lý
    // errors -> đẩy ra lỗi khi giá trị nhập vào không hợp lệ
    // handleSubmit -> chỉ nhận vào hàm submit form và submit dữ liệu
    // watch -> tương tự onChange
    const {
        register,
        formState: { errors },
        handleSubmit,
        watch,
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
            retypedPassword: '',
        },
    });
    // eslint-disable-next-line no-unused-vars
    const navigate = useNavigate();

    const handleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleShowRetypedPassword = () => {
        setShowRetypedPassword((prev) => !prev);
    };

    const submitData = async (data) => {
        try {
            // eslint-disable-next-line no-unused-vars
            const {retypedPassword, ...res} = data
            // eslint-disable-next-line no-unused-vars
            const response = await get('/register', { res });
            toast.success('Register successfully', {
                ...styleMessage,
            });
            // lưu thông tin vào redux
            // chuyển vào trang chính
            //navigate('/');
        } catch (error) {
            toast.error(error, {
                ...styleMessage,
            });
            return;
        }
    };

    // lấy giá trị password mỗi lần nhập
    const password = watch('password');

    return (
        <div className={cx('wrapper-login')}>
            <div className={cx('form-login')}>
                <h1>Chào mừng bạn đến với {softwareName}</h1>

                <form className={cx('form')} onSubmit={handleSubmit(submitData)}>
                    <h2>Đăng ký</h2>
                    <label className={cx('form-control')} htmlFor="emailUser">
                        <span>Email</span>
                        <div className={cx('input-form')}>
                            <input
                                {...register('email', {
                                    required: 'Email không để trống',
                                    pattern: {
                                        value: /^[\w.]+@(gmail|yahoo|edu)\.(com|com.vn)$/,
                                        message: 'Email không hợp lệ -> VD: abc@gmail.com',
                                    },
                                })}
                                id="emailUser"
                                type="email"
                                name="email"
                                placeholder="Nhập email"
                            />
                            <Mail className={cx('icon')} size={17} />
                        </div>
                        {errors.email && <p className={cx('error-message')}>{errors.email.message}</p>}
                    </label>
                    <label className={cx('form-control')} htmlFor="passwordUser">
                        <span>Password</span>
                        <div className={cx('input-form')}>
                            <input
                                {...register('password', {
                                    required: 'Mật khẩu không để trống',
                                    pattern: {
                                        value: /^[\w]+(@|#|%)$/,
                                        message: 'Mật khẩu có cả chữ hoa, chữ thường, số và kí tự đặc biệt',
                                    },
                                    minLength: {
                                        value: 8,
                                        message: 'Mật khẩu có độ dài tối thiểu 8 kí tự',
                                    },
                                })}
                                id="passwordUser"
                                type={!showPassword ? 'password' : 'text'}
                                name="password"
                                placeholder="Nhập mật khẩu"
                            />
                            {!showPassword ? (
                                <EyeClosed size={17} className={cx('icon')} onClick={handleShowPassword} />
                            ) : (
                                <Eye size={17} className={cx('icon')} onClick={handleShowPassword} />
                            )}
                        </div>
                        {errors.password && <p className={cx('error-message')}>{errors.password.message}</p>}
                    </label>
                    <label className={cx('form-control')} htmlFor="retypedPasswordUser">
                        <span>Retyped password</span>
                        <div className={cx('input-form')}>
                            <input
                                {...register('retypedPassword', {
                                    required: 'Xác nhận mật khẩu không để trống',
                                    validate: (value) => 
                                        value === password ||'Xác nhận mật khẩu không khớp'
                                })}
                                id="retypedPasswordUser"
                                type={!showRetypedPassword ? 'password' : 'text'}
                                name="retypedPassword"
                                placeholder="Xác nhận mật khẩu"
                            />
                            {!showRetypedPassword ? (
                                <EyeClosed size={17} className={cx('icon')} onClick={handleShowRetypedPassword} />
                            ) : (
                                <Eye size={17} className={cx('icon')} onClick={handleShowRetypedPassword} />
                            )}
                        </div>
                        {errors.retypedPassword && (
                            <p className={cx('error-message')}>{errors.retypedPassword.message}</p>
                        )}
                    </label>
                    <Button className={cx('btn-submit')} text medium type="submit">
                        Đăng ký
                    </Button>
                    <p className={cx('other')}>
                        Already have a account?{' '}
                        <Button text className={cx('link-register')} to={'/login'}>
                            Đăng nhập
                        </Button>
                    </p>
                </form>
            </div>
            <div className={cx('image-preview')} style={{ backgroundImage: `url(${logo})` }}></div>
        </div>
    );
};

export default Register;
