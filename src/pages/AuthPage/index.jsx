import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './AuthPage.module.scss';
import { Image, Button, ModalCreateAccount, ModalEmployee, ModelFilter, Modal } from '@/components';
import { MyTable } from '@/components';
import globalStyle from '../../components/GlobalStyle/GlobalStyle.module.scss';
import Tippy from '@tippyjs/react';
import { Eye, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatRole, styleMessage } from '../../constants';
import request, { post } from '../../utils/httpRequest';
import { uploadImage } from '../../utils/uploadImage';
import { validateEmployeeData } from '../../utils/validate';
import EmployeeDTO from '../../dtos/EmployeeDTO';
import { ModalReadEmployee } from '../../components';
import { useSelector } from 'react-redux';

const cx = classNames.bind(styles);
const cxGlobal = classNames.bind(globalStyle);

const dataSource = [
    {
        key: '1',
        empId: 'NV001',
        empName: 'Nguyễn Văn A',
        empCCCD: '012345678901',
        empDob: '1990-01-01',
        gender: 'Nam',
        empPhone: '0901234567',
        empAddress: 'Hà Nội',
        empStartDate: '2020-05-01',
        warehouseId: 'K01',
        empRole: [
            {
                roleID: 1,
                roleName: 'SYSTEM_ADMIN',
            },
        ],
        empStatus: 'Đang làm',
        empImage:
            'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482784zzu/anh-mo-ta.png',
    },
    // {
    //     key: '2',
    //     empId: 'NV002',
    //     empName: 'Trần Thị B',
    //     empCCCD: '012345678902',
    //     empDob: '1992-03-15',
    //     gender: 'Nữ',
    //     empPhone: '0902345678',
    //     empAddress: 'TP.HCM',
    //     empStartDate: '2021-06-15',
    //     warehouseId: 'K02',
    //     empRole: 'Nhân viên xuất hàng',
    //     empStatus: 'Đang làm',
    //     empImage:
    //         'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482784zzu/anh-mo-ta.png',
    // },
    // {
    //     key: '3',
    //     empId: 'NV003',
    //     empName: 'Lê Văn C',
    //     empCCCD: '012345678903',
    //     empDob: '1995-07-20',
    //     gender: 'Nam',
    //     empPhone: '0903456789',
    //     empAddress: 'Đà Nẵng',
    //     empStartDate: '2022-01-10',
    //     warehouseId: 'K01',
    //     empRole: 'Nhân viên nhận hàng',
    //     empStatus: 'Nghỉ việc',
    //     empImage:
    //         'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482784zzu/anh-mo-ta.png',
    // },
    // {
    //     key: '4',
    //     empId: 'NV004',
    //     empName: 'Phạm Thị D',
    //     empCCCD: '012345678904',
    //     empDob: '1998-12-05',
    //     gender: 'Nữ',
    //     empPhone: '0904567890',
    //     empAddress: 'Cần Thơ',
    //     empStartDate: '2023-03-01',
    //     warehouseId: 'K03',
    //     empRole: 'Quản lý kho',
    //     empStatus: 'Đang làm',
    //     empImage:
    //         'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482784zzu/anh-mo-ta.png',
    // },
    // {
    //     key: '5',
    //     empId: 'NV005',
    //     empName: 'Đỗ Văn E',
    //     empCCCD: '012345678905',
    //     empDob: '2000-10-12',
    //     gender: 'Nam',
    //     empPhone: '0905678901',
    //     empAddress: 'Hải Phòng',
    //     empStartDate: '2024-01-20',
    //     warehouseId: 'K02',
    //     empRole: 'Kế toán',
    //     empStatus: 'Đang làm',
    //     empImage:
    //         'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482784zzu/anh-mo-ta.png',
    // },
];

const resetData = {
    empId: '',
    empName: '',
    empCCCD: '',
    empDob: '',
    gender: '',
    empPhone: '',
    empAddress: '',
    empStartDate: '',
    empEndDate: '',
    warehouseId: '',
    empRole: [],
    empStatus: '',
    empImage: '',
};

const AuthPage = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState(null);
    const [action, setAction] = useState({
        add: false,
        update: false,
        createAccount: false,
    });
    const warehouse = useSelector((state) => state.WareHouseSlice.warehouse);

    const [empData, setEmpData] = useState(resetData);
    const [showModalAccount, setShowModalAccount] = useState(false);
    const [account, setAccount] = useState({
        email: '',
        password: '',
        statusWork: 'Đang làm',
    });

    const [filterSearchEmployee, setFilterSearchEmployee] = useState({
        employeeID: '',
        phoneNumber: '',
        status: 'ACTIVE',
    });

    const columnsFilter = [
        {
            id: 1,
            label: 'Mã nhân viên',
            value: filterSearchEmployee.employeeID,
            setValue: (value) => setFilterSearchEmployee((prev) => ({ ...prev, employeeID: value })),
        },
        {
            id: 2,
            label: 'Số điện thoại',
            value: filterSearchEmployee.phoneNumber,
            setValue: (value) => setFilterSearchEmployee((prev) => ({ ...prev, phoneNumber: value })),
        },
        // {
        //     id: 3,
        //     label: 'Chức vụ',
        //     value: filterSearchEmployee.status,
        //     setValue: (value) => setCurrentPageEmployee(prev => ({...prev, phoneNumber: value}))
        // },
    ];

    //table columns
    const tableColumns = [
        {
            title: 'Mã nhân viên',
            dataIndex: 'empId',
            key: 'empId',
        },
        {
            title: 'Tên nhân viên',
            dataIndex: 'empName',
            key: 'empName',
        },
        // {
        //     title: 'CCCD',
        //     dataIndex: 'empCCCD',
        //     key: 'empCCCD',
        // },
        {
            title: 'Ngày sinh',
            dataIndex: 'empDob',
            key: 'empDob',
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'empPhone',
            key: 'empPhone',
        },
        // {
        //     title: 'Địa chỉ',
        //     dataIndex: 'empAddress',
        //     key: 'empAddress',
        // },
        {
            title: 'Ngày vào làm',
            dataIndex: 'empStartDate',
            key: 'empStartDate',
        },
        {
            title: 'Mã kho',
            dataIndex: 'warehouseId',
            key: 'warehouseId',
        },
        // {
        //     title: 'Chức vụ',
        //     dataIndex: 'empRole',
        //     key: 'empRole',
        //     render: (_, record) => <p>{record.empRole.map((item) => formatRole[item.roleName]).join(',')}</p>,
        // },
        {
            title: 'Trạng thái',
            dataIndex: 'empStatus',
            key: 'empStatus',
        },
        {
            title: 'Thao tác',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => {
                return (
                    <div className={cxGlobal('action-table')}>
                        <Tippy content={'Chỉnh sữa'} placement="bottom-end">
                            <button
                                className={cxGlobal('action-table-icon')}
                                onClick={() => {
                                    setSelectedRowKeys(record.empId);
                                    console.log(record.empId);
                                }}
                            >
                                <Pencil size={20} />
                            </button>
                        </Tippy>
                    </div>
                );
            },
        },
    ];

    // select box for model filter search
    const selectBoxFilter = [
        {
            label: 'Trạng thái làm việc',
            value: filterSearchEmployee.status,
            option: [
                {
                    name: 'Đang làm',
                    value: 'ACTIVE',
                },
                {
                    name: 'Nghỉ việc',
                    value: 'INACTIVE',
                },
            ],
            setValue: (value) => setFilterSearchEmployee((prev) => ({ ...prev, status: value })),
        },
    ];

    const [statusCreateAccount, setStatusCreateAccount] = useState(false);
    const [currentPageEmployee, setCurrentPageEmployee] = useState(1);

    const onChangeEmployeeTable = (newPage, pageSize) => setCurrentPageEmployee(newPage);

    const [employeeList, setEmployeeList] = useState([]);
    const employeeSelected = useMemo(() => {
        if (!selectedRowKeys) {
            return null;
        } else {
            return employeeList.find((item) => item.empId == selectedRowKeys);
        }
    }, [selectedRowKeys]);

    // const rowSelection = {
    //     type: 'radio',
    //     selectedRowKeys,
    //     onChange: (newSelectedRowKeys) => {
    //         setSelectedRowKeys(newSelectedRowKeys);
    //         setAction((prev) => ({
    //             add: false,
    //             update: true,
    //             createAccount: false,
    //         }));
    //         window.scrollTo(top);
    //     },
    // };

    const handleAddEmployee = async () => {
        if (!statusCreateAccount) {
            toast.error('Vui lòng tạo tài khoản cho nhân viên trước khi thêm nhân viên', {
                ...styleMessage,
            });
            return;
        }
        // validate dữ liệu
        if (!validateEmployeeData(empData)) return;
        try {
            const token = JSON.parse(localStorage.getItem('tokenUser'));
            const imageUrl = await uploadImage(empData.empImage);
            const requestData = {
                employeeID: empData.empId,
                email: account.email,
                password: account.password,
                confirmPassword: account.password,
                status: account.statusWork == 'Đang làm' ? 'ACTIVE' : 'INACTIVE',
                employeeName: empData.empName,
                cccd: empData.empCCCD,
                dob: empData.empDob,
                phoneNumber: empData.empPhone,
                gender: empData.gender == 'Nam' ? 'male' : 'female',
                image: imageUrl,
                address: empData.empAddress,
                startDate: empData.empStartDate,
                endDate: null,
                roles: empData.empRole,
                warehouseID: warehouse.warehouseID,
            };
            console.log('warehouse', empData);
            //call api thêm nhân viên
            const response = await request.post('/api/account/sign-up', requestData, {
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeid: token.employeeID,
                    warehouseid: warehouse.warehouseID,
                },
            });
            toast.success('Thêm nhân viên mới thành công', styleMessage);
            setEmpData(resetData);
            setAccount({
                email: '',
                password: '',
                statusWork: 'Đang làm',
            });
            setStatusCreateAccount(false);
            handleCloseModal('add', false);
            fetchEmployeeList();
        } catch (err) {
            console.log(err);
            const message =
                typeof err.response.data.message == Object
                    ? err.response.data.message.map((item) => item).join(',')
                    : err.response.data.message;

            toast.error(message, styleMessage);
        }
    };

    const handleCloseModal = (key, value) => {
        if (key === 'update') {
            setSelectedRowKeys(null);
        }
        setAction((prev) => ({ ...prev, [key]: value }));
        setTimeout(() => {
            setEmpData(resetData);
        }, 1000);
    };

    useEffect(() => {
        if (!selectedRowKeys) return;

        setEmpData(employeeList.find((item) => item.empId == selectedRowKeys));
        setAction((prev) => ({
            add: false,
            update: true,
            createAccount: false,
        }));
    }, [selectedRowKeys]);

    const handleUpdateEmployee = async () => {
        const validValue = validateEmployeeData(empData, 'update');
        if (!validValue) return;
        try {
            // call api update employee
            const token = JSON.parse(localStorage.getItem('tokenUser'));
            const infoEmployeeBefore = employeeList.find((item) => item.empId == selectedRowKeys);
            let imageUrl = '';
            if (infoEmployeeBefore.empImage == empData.empImage) {
                imageUrl = infoEmployeeBefore.empImage;
            } else {
                imageUrl = await uploadImage(empData.empImage);
            }

            const requestData = {
                employeeID: empData.empId,
                email: account.email,
                password: account.password,
                status: empData.empStatus == 'Đang làm' ? 'ACTIVE' : 'INACTIVE',
                employeeName: empData.empName,
                cccd: empData.empCCCD,
                dob: empData.empDob,
                phoneNumber: empData.empPhone,
                gender: empData.gender == 'Nam' ? 'male' : 'female',
                image: imageUrl,
                address: empData.empAddress,
                startDate: empData.empStartDate,
                endDate: empData.empStatus == 'Nghỉ việc' ? empData.empEndDate : null,
                roles: empData.empRole,
                warehouseID: warehouse.warehouseID,
            };
            //call api thêm nhân viên
            const response = await request.put('/api/employee/update', requestData, {
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeid: token.employeeID,
                    warehouseid: warehouse.warehouseID,
                },
            });
            toast.success('Cập nhật nhân viên thành công', styleMessage);
            setEmpData(resetData);
            setAccount({
                email: '',
                password: '',
                statusWork: 'Đang làm',
            });
            fetchEmployeeList();
            handleCloseModal('update', false);
        } catch (err) {
            console.log(err);
            // throw err
            toast.error(
                Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
                styleMessage,
            );
            return;
        }
    };

    const showModalCreateAccount = async () => {
        try {
            // call api check empId exist
            setShowModalAccount((prev) => !prev);
        } catch (err) {
            toast.error('Vui lòng tạo nhân viên trước khi tạo tài khoản');
        }
    };

    const fetchEmployeeList = async () => {
        try {
            const { employeeID, accessToken } = JSON.parse(localStorage.getItem('tokenUser'));
            const response = await post(
                '/api/employee/list',
                {
                    employeeID: employeeID,
                },
                accessToken,
                employeeID,
            );

            const formatEmployee = response.employees.map((item) => {
                const emp = new EmployeeDTO(item);
                return { ...emp };
            });

            setEmployeeList(formatEmployee);
        } catch (err) {
            console.log('fetch employee list err', err.response.data.message);
            setEmployeeList([]);
        }
    };

    const handleResetFilter = () => {
        setFilterSearchEmployee({
            employeeID: '',
            phoneNumber: '',
            status: 'ACTIVE',
        });
        fetchEmployeeList();
    };

    const handleSearch = async () => {
        if (!Object.keys(filterSearchEmployee).some((key) => filterSearchEmployee[key])) return;
        try {
            const tokenUser = JSON.parse(localStorage.getItem('tokenUser'));
            const params = { ...filterSearchEmployee };
            console.log(tokenUser);
            const resultSearch = await request.get('/api/employee/filter', {
                params,
                headers: {
                    token: `Beare ${tokenUser.accessToken}`,
                    employeeid: tokenUser.employeeID,
                },
            });
            const formatEmployee = resultSearch.data.employeeFilter.map((item) => {
                const emp = new EmployeeDTO(item);
                return { ...emp };
            });
            setEmployeeList(formatEmployee);
        } catch (err) {
            fetchEmployeeList();
        }
    };

    useEffect(() => {
        fetchEmployeeList();
    }, []);

    return (
        <div className={cx('wrapper-auth')}>
            {action.add && (
                <ModalEmployee
                    isOpenInfo={true}
                    arrButton={[
                        (index) => (
                            <Button key={index} primary onClick={handleAddEmployee}>
                                <span>Thêm nhân viên</span>
                            </Button>
                        ),
                        (index) => (
                            <Button key={index} primary onClick={showModalCreateAccount}>
                                <span>Tạo tài khoản</span>
                            </Button>
                        ),
                    ]}
                    className={cx('wrapper-model-employee')}
                    data={empData}
                    isAdmin={true}
                    onClose={() => handleCloseModal('add', false)}
                    setData={setEmpData}
                    action={'add'}
                />
            )}
            {action.update && employeeSelected?.empStatus != 'Nghỉ việc' ? (
                <ModalEmployee
                    isOpenInfo={true}
                    arrButton={[
                        (index) => (
                            <Button key={index} primary onClick={handleUpdateEmployee}>
                                <span>Cập nhật</span>
                            </Button>
                        ),
                    ]}
                    className={cx('wrapper-model-employee')}
                    isAdmin={true}
                    data={empData}
                    onClose={() => handleCloseModal('update', false)}
                    setData={setEmpData}
                    action={'update'}
                />
            ) : (
                <Modal showButtonClose={false} isOpenInfo={action.update} onClose={() => {}}>
                    <ModalReadEmployee
                        className={cx('wrapper-model-employee')}
                        data={empData}
                        onClose={() => handleCloseModal('update', false)}
                    />
                </Modal>
            )}

            {/** Lọc theo điều kiện */}
            <ModelFilter
                columns={columnsFilter}
                handleResetFilters={handleResetFilter}
                handleSubmitFilter={handleSearch}
                selectInput={selectBoxFilter}
            >
                <Button primary onClick={() => handleCloseModal('add', true)} disabled={action.add}>
                    <span>Thêm nhân viên</span>
                </Button>
            </ModelFilter>

            <h1>Danh sách nhân viên</h1>
            <MyTable
                //rowSelection={rowSelection}
                data={employeeList}
                columns={tableColumns}
                pageSize={4}
                pagination
                //className={cx('my-table-employee')}
                currentPage={currentPageEmployee}
                onChangePage={onChangeEmployeeTable}
            ></MyTable>

            {showModalAccount && (
                <ModalCreateAccount
                    isOpen={showModalAccount}
                    onClose={() => setShowModalAccount((prev) => !prev)}
                    setAccount={setAccount}
                    setStatusCreateAccount={setStatusCreateAccount}
                />
            )}
        </div>
    );
};

export default AuthPage;
