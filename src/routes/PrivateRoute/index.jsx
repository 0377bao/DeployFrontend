// src/components/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { styleMessage } from '../../constants';
import { useEffect, useRef } from 'react';

export default function PrivateRoute({ children, roles = [] }) {
    const { user } = useSelector((state) => state.AuthSlice);
    const location = useLocation();
    const toastShown = useRef(false);

    useEffect(() => {
        toastShown.current = false;
    }, [location.pathname]);

    const userRoles = user?.empRole?.map((role) => role.roleName) || [];

    if (roles.includes('PUBLIC')) return children;

    if (!user) {
        if (location.pathname !== '/login' && !toastShown.current) {
            console.log(location.pathname);

            toast.error('Bạn phải đăng nhập để truy cập trang này.', styleMessage);
            toastShown.current = true;
        }

        return <Navigate to="/login" replace />;
    }

    const hasPermission = roles.some((role) => userRoles.includes(role));
    if (hasPermission) return children;

    if (!toastShown.current) {
        toast.error('Bạn không có quyền truy cập trang này.', styleMessage);
        toastShown.current = true;
    }
    return <Navigate to="/" replace />;
}
