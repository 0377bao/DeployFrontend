import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import Button from '@/components/Button';
import { Eye, EyeClosed, Mail } from 'lucide-react';
import logo from '@/assets/logo_v2.jpg';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { post } from '@/utils/httpRequest';
import { useNavigate } from 'react-router-dom';
import { styleMessage } from '../../constants';
import { useDispatch } from 'react-redux';
import { login } from '@/lib/redux/auth/authSlice';
import { jwtDecode } from 'jwt-decode';
import EmployeeDTO from '../../dtos/EmployeeDTO';
import request from '../../utils/httpRequest';
import { addInfo } from '../../lib/redux/warehouse/wareHouseSlice';
import { logout } from '../../lib/redux/auth/authSlice';
import { resetActiveItemDrop } from '../../lib/redux/dropSidebar/dropSidebarSlice';

const cx = classNames.bind(styles);
const softwareName = import.meta.env.VITE_SOFTWARE_NAME;

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // 🧹 Dọn sạch dữ liệu khi vào trang login
    useEffect(() => {
        if (localStorage.getItem('tokenUser')) {
            dispatch(logout());
            dispatch(resetActiveItemDrop());
            localStorage.removeItem('tokenUser');
            localStorage.removeItem('indexItemDropActive');
            localStorage.removeItem('warehouse');
        }
    }, [dispatch]);

    const handleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const submitData = async (data) => {
        try {
            const responseLogin = await post('/api/account/sign-in', { ...data });

            if (responseLogin.status == 'OK') {
                const { message, accessToken, refreshToken } = responseLogin;
                const { employeeID, roles, warehouseID } = jwtDecode(accessToken).payload;

                // call api get user detail
                const responseUser = await post(
                    '/api/employee/employee-detail',
                    {
                        email: data.email,
                    },
                    accessToken,
                    employeeID,
                );
                const { employee } = responseUser;

                if (warehouseID) {
                    const responseWarehouse = await request.get(`/api/warehouse/get-detail/${warehouseID}`, {
                        headers: {
                            token: `Beare ${accessToken}`,
                            employeeid: employeeID,
                            warehouseid: warehouseID,
                        },
                    });
                    dispatch(addInfo({ ...responseWarehouse.data.warehouse }));
                    localStorage.setItem('warehouse', JSON.stringify({ ...responseWarehouse.data.warehouse }));
                }

                dispatch(login({ ...new EmployeeDTO({ ...employee, roles }) }));
                localStorage.setItem(
                    'tokenUser',
                    JSON.stringify({ email: data.email, employeeID, accessToken, refreshToken }),
                );
                toast.success(message, {
                    ...styleMessage,
                });
                // lưu thông tin vào redux
                // chuyển vào trang chính
                navigate('/');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message, {
                ...styleMessage,
            });
            return;
        }
    };

    return (
        <div className={cx('wrapper-login')}>
            <div className={cx('form-login')}>
                <h1>Chào mừng bạn đến với {softwareName}</h1>

                <form className={cx('form')} onSubmit={handleSubmit(submitData)}>
                    <h2>Đăng nhập</h2>
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
                                {...register('password', { required: 'Mật khẩu không để trống' })}
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
                    <Button className={cx('btn-submit')} text medium type="submit">
                        Đăng nhập
                    </Button>
                </form>
            </div>
            <div className={cx('image-preview')} style={{ backgroundImage: `url(${logo})` }}></div>
        </div>
    );
};

export default Login;
