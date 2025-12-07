import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, Image } from '../../components';
import { jwtDecode } from 'jwt-decode';
import classNames from 'classnames/bind';
import styles from './ProfilePage.module.scss';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { styleMessage, formatRole } from '../../constants';
import { startLoading, stopLoading } from '../../lib/redux/loading/slice';
import { Eye, EyeClosed, User, Calendar, Phone, MapPin, Briefcase, Key } from 'lucide-react';
import { post } from '../../utils/httpRequest';

const cx = classNames.bind(styles);

const ProfilePage = () => {
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const [account, setAccount] = useState({
        email: '',
        newPassword: '',
        confirmPassword: '',
        oldPassword: '',
    });
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypedPassword, setShowRetypedPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const {
        register,
        formState: { errors },
        handleSubmit,
        watch,
        setValue,
        reset,
    } = useForm();
    const dispatch = useDispatch();

    const newPassword = watch('newPassword');

    const handleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleShowRetypedPassword = () => {
        setShowRetypedPassword((prev) => !prev);
    };

    const handleShowOldPassword = () => {
        setShowOldPassword((prev) => !prev);
    };

    const handleShowModalUpdateAccount = (action) => {
        if (action === 'open') {
            setIsOpenModal(true);
        } else {
            setIsOpenModal(false);
            setAccount((prev) => ({ ...prev, newPassword: '', confirmPassword: '', oldPassword: '' }));
            reset();
            setShowPassword(false);
            setShowRetypedPassword(false);
            setShowOldPassword(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const { accessToken, employeeID } = JSON.parse(localStorage.getItem('tokenUser'));
            dispatch(startLoading());
            const updateResult = await post(
                '/api/account/change-password',
                {
                    email: account.email,
                    oldPassword: data.oldPassword,
                    newPassword: data.newPassword,
                    confirmPassword: data.confirmPassword,
                },
                accessToken,
                employeeID,
            );
            dispatch(stopLoading());
            handleShowModalUpdateAccount('close');
            toast.success(updateResult.message, styleMessage);
        } catch (err) {
            console.log(err);
            dispatch(stopLoading());
            toast.error(err.response?.data?.message?.[0] || 'Có lỗi xảy ra', styleMessage);
        }
    };

    useEffect(() => {
        try {
            const tokenUser = JSON.parse(localStorage.getItem('tokenUser'));
            if (tokenUser) {
                const { accessToken } = tokenUser;
                const { email } = jwtDecode(accessToken).payload;
                setAccount((prev) => ({ ...prev, email }));
            }
        } catch (error) {
            console.error('Error decoding token', error);
        }
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('profile-container')}>
                <div className={cx('header-cover')}></div>

                <div className={cx('profile-content')}>
                    {/* Left Column - Avatar & Basic Info */}
                    <div className={cx('left-column')}>
                        <div className={cx('avatar-container')}>
                            <Image
                                src={
                                    currentUser?.empImage ||
                                    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png'
                                }
                                alt="Avatar"
                            />
                        </div>
                        <h2 className={cx('employee-name')}>{currentUser?.empName || 'Nhân viên'}</h2>
                        <div className={cx('employee-role')}>
                            {currentUser?.empRole?.map((role) => formatRole[role.roleName]).join(', ') ||
                                'Chưa có chức vụ'}
                        </div>
                        <div
                            className={cx(
                                'status-badge',
                                currentUser?.empStatus === 'Đang làm việc' ? 'active' : 'inactive',
                            )}
                        >
                            {currentUser?.empStatus || 'Không xác định'}
                        </div>
                    </div>

                    {/* Right Column - Detailed Info */}
                    <div className={cx('right-column')}>
                        <div className={cx('section-title')}>
                            <User size={20} />
                            Thông tin cá nhân
                        </div>

                        <div className={cx('info-grid')}>
                            <div className={cx('info-item')}>
                                <label>Mã nhân viên</label>
                                <span>{currentUser?.empId}</span>
                            </div>
                            <div className={cx('info-item')}>
                                <label>CCCD/CMND</label>
                                <span>{currentUser?.empCCCD || 'Chưa cập nhật'}</span>
                            </div>
                            <div className={cx('info-item')}>
                                <label>Ngày sinh</label>
                                <span>{formatDate(currentUser?.empDob)}</span>
                            </div>
                            <div className={cx('info-item')}>
                                <label>Giới tính</label>
                                <span>{currentUser?.gender || 'Chưa cập nhật'}</span>
                            </div>
                            <div className={cx('info-item')}>
                                <label>Số điện thoại</label>
                                <span>{currentUser?.empPhone || 'Chưa cập nhật'}</span>
                            </div>
                            <div className={cx('info-item')}>
                                <label>Địa chỉ</label>
                                <span>{currentUser?.empAddress || 'Chưa cập nhật'}</span>
                            </div>
                            <div className={cx('info-item')}>
                                <label>Ngày vào làm</label>
                                <span>{formatDate(currentUser?.empStartDate)}</span>
                            </div>
                            <div className={cx('info-item')}>
                                <label>Kho làm việc</label>
                                <span>{currentUser?.warehouseId || 'Chưa phân công'}</span>
                            </div>
                        </div>

                        <div className={cx('section-title')}>
                            <Key size={20} />
                            Tài khoản & Bảo mật
                        </div>

                        <div className={cx('account-section')}>
                            <div className={cx('account-info')}>
                                <div className={cx('account-details')}>
                                    <span className={cx('email')}>{account.email}</span>
                                    <span className={cx('password-placeholder')}>••••••••••••</span>
                                </div>
                                <Button
                                    primary
                                    medium
                                    borderRadiusSmall
                                    onClick={() => handleShowModalUpdateAccount('open')}
                                >
                                    Đổi mật khẩu
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            <Modal
                isOpenInfo={isOpenModal}
                onClose={() => handleShowModalUpdateAccount('close')}
                showButtonClose={false}
            >
                <form onSubmit={handleSubmit(onSubmit)} className={cx('wrapper-password')}>
                    <h2>Đổi mật khẩu</h2>

                    <div className={cx('form-group')}>
                        <label htmlFor="oldPassword">Mật khẩu hiện tại</label>
                        <div className={cx('form-control')}>
                            <input
                                id="oldPassword"
                                type={!showOldPassword ? 'password' : 'text'}
                                placeholder="Nhập mật khẩu hiện tại"
                                {...register('oldPassword', {
                                    required: 'Vui lòng nhập mật khẩu cũ',
                                })}
                            />
                            {showOldPassword ? (
                                <Eye size={20} className={cx('icon')} onClick={handleShowOldPassword} />
                            ) : (
                                <EyeClosed size={20} className={cx('icon')} onClick={handleShowOldPassword} />
                            )}
                        </div>
                        {errors.oldPassword && <p className={cx('message-error')}>{errors.oldPassword.message}</p>}
                    </div>

                    <div className={cx('form-group')}>
                        <label htmlFor="newPassword">Mật khẩu mới</label>
                        <div className={cx('form-control')}>
                            <input
                                id="newPassword"
                                type={!showPassword ? 'password' : 'text'}
                                placeholder="Nhập mật khẩu mới"
                                {...register('newPassword', {
                                    required: 'Vui lòng nhập mật khẩu mới',
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                                        message: 'Mật khẩu phải có chữ hoa, chữ thường, số và kí tự đặc biệt',
                                    },
                                    minLength: {
                                        value: 8,
                                        message: 'Mật khẩu phải có ít nhất 8 kí tự',
                                    },
                                })}
                            />
                            {showPassword ? (
                                <Eye size={20} className={cx('icon')} onClick={handleShowPassword} />
                            ) : (
                                <EyeClosed size={20} className={cx('icon')} onClick={handleShowPassword} />
                            )}
                        </div>
                        {errors.newPassword && <p className={cx('message-error')}>{errors.newPassword.message}</p>}
                    </div>

                    <div className={cx('form-group')}>
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                        <div className={cx('form-control')}>
                            <input
                                id="confirmPassword"
                                type={!showRetypedPassword ? 'password' : 'text'}
                                placeholder="Nhập lại mật khẩu mới"
                                {...register('confirmPassword', {
                                    required: 'Vui lòng xác nhận mật khẩu',
                                    validate: (value) => {
                                        return newPassword === value || 'Mật khẩu xác nhận không khớp';
                                    },
                                })}
                            />
                            {showRetypedPassword ? (
                                <Eye size={20} className={cx('icon')} onClick={handleShowRetypedPassword} />
                            ) : (
                                <EyeClosed size={20} className={cx('icon')} onClick={handleShowRetypedPassword} />
                            )}
                        </div>
                        {errors.confirmPassword && (
                            <p className={cx('message-error')}>{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <div className={cx('footer-action')}>
                        <Button
                            type="button"
                            outline
                            medium
                            borderRadiusSmall
                            onClick={() => handleShowModalUpdateAccount('close')}
                        >
                            Huỷ
                        </Button>
                        <Button type="submit" primary medium borderRadiusSmall>
                            Lưu thay đổi
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProfilePage;
