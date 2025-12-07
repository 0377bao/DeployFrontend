import React, { Fragment, useEffect, useState } from 'react';
import { Routes, Route, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { publicRoute } from './routes';
import DefaultLayout from './layouts/DefaultLayout';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { post } from './utils/httpRequest';
import EmployeeDTO from './dtos/EmployeeDTO';
import { login, logout } from './lib/redux/auth/authSlice';
import { setGlobalLoadingHandler } from '../src/utils/httpRequest';
import { Loading } from './components';
import { changDropItem } from './lib/redux/dropSidebar/dropSidebarSlice';
import { addInfo } from './lib/redux/warehouse/wareHouseSlice';
import PrivateRoute from './routes/PrivateRoute';

const RootLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isAuthReady, setIsAuthReady] = useState(false); // 🔹 chặn render trước khi load xong

    useEffect(() => {
        const initAuth = async () => {
            try {
                const tokenUser = localStorage.getItem('tokenUser');
                const warehouse = localStorage.getItem('warehouse');

                // Nếu có thông tin kho
                if (warehouse && warehouse !== 'null') {
                    dispatch(addInfo(JSON.parse(warehouse)));
                }

                // Nếu chưa có token -> logout + về login
                if (!tokenUser || tokenUser === 'null') {
                    dispatch(logout());
                    navigate('/login', { replace: true });
                    setIsAuthReady(true);
                    return;
                }

                // Có token -> decode + fetch user
                const { employeeID, email, accessToken } = JSON.parse(tokenUser);
                const { roles } = jwtDecode(accessToken).payload;

                const responseUser = await post('/api/employee/employee-detail', { email }, accessToken, employeeID);

                const { employee } = responseUser;
                dispatch(login({ ...new EmployeeDTO({ ...employee, roles }) }));

                // Load sidebar
                const itemDropActiveSidebar = JSON.parse(localStorage.getItem('indexItemDropActive')) || [];
                dispatch(changDropItem(itemDropActiveSidebar));

                setIsAuthReady(true);
            } catch (err) {
                console.error('Auth error:', err);
                // Nếu lỗi -> dọn sạch & logout
                localStorage.removeItem('tokenUser');
                localStorage.removeItem('indexItemDropActive');
                localStorage.removeItem('warehouse');
                dispatch(logout());
                navigate('/login', { replace: true });
                setIsAuthReady(true);
            }
        };

        initAuth();
    }, [dispatch, navigate]);

    if (!isAuthReady) {
        return <Loading />;
    }
    return <Outlet />;
};

function App() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setGlobalLoadingHandler(setLoading);
    }, []);

    return (
        <>
            <Routes>
                <Route element={<RootLayout />}>
                    {publicRoute.map((route, index) => {
                        let Page = route.page;
                        let Layout = route.layout == null ? Fragment : route.layout;

                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <PrivateRoute roles={route.roles}>
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    </PrivateRoute>
                                }
                            />
                        );
                    })}
                </Route>
            </Routes>
            <Toaster />
            {loading && <Loading />}
        </>
    );
}

export default App;
