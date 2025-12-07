import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalReadEmployee.module.scss';
import { Button, Image, Modal } from '@/components';
import { Eye, XCircle, ArrowRightLeft } from 'lucide-react';
import Tippy from '@tippyjs/react';
import md5 from 'md5';
import { formatRole, mapperRole } from '../../constants';
import request from "@/utils/httpRequest"
import { useSelector } from 'react-redux';

const cx = classNames.bind(styles);
const roleEmployee = ['Quản lý kho', 'Nhân viên nhận hàng', 'Nhân viên xuất hàng', 'Kế toán'];

const FormGroup = ({
    labelTitle,
    htmlForLabel,
    typeInput,
    valueInput,
    children,
    readOnly=true,
    idInput,
    onChange,
    checked = false,
}) => {
    return (
        <div className={cx('form-group')}>
            <label htmlFor={htmlForLabel}>{labelTitle}</label>
            <input
                id={idInput}
                type={typeInput}
                readOnly={readOnly}
                value={valueInput}
                onChange={onChange}
                checked={checked}
            />
            {children}
        </div>
    );
};

const ModalReadEmployee = ({ data, onClose, className }) => {
    const [viewDetailRole, setViewDetailRole] = useState(false);
    const listRoleUser = data.empRole || [];

    const handleShowViewDetailRole = () => {
        setViewDetailRole((prev) => !prev);
    };


    // useEffect(() => {
    //     //fetch all warehouse
    //     const fetchWarehouseList = async () => {
    //         const token = JSON.parse(localStorage.getItem('tokenUser'))
            
    //         try{
    //             const response = await request.get('/api/warehouse/list', {
    //                 headers: {
    //                     token: `Beare ${token.accessToken}`,
    //                     employeeid: currentUser.empId
    //                 }
    //             })
    //             const formatWarehouseId = response.data.warehouses.map(ware => ware.warehouseID)
    //             setListWarehouseId(formatWarehouseId)
    //         }catch(err) {
    //             setListWarehouseId([])
    //         }
    //     }

    //     fetchWarehouseList()
    // }, []);

   

    return (
        <div className={cx('modal-employee-info', className)}>
            <div className={cx('modal-header')}>
                <h1>Thông tin nhân viên</h1>
                {location.pathname === '/auth' && (
                    <XCircle size={22} className={cx('btn-close-modal')} onClick={onClose} />
                )}
            </div>

            <div className={cx('content')}>
                <div className={cx('image-preview')}>
                    <Image
                        classname={cx('image-upload')}
                        src={
                            data.empImage === ''
                                ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png'
                                : data.empImage
                        }
                        alt={'image-employee'}
                    />
                </div>
                <div className={cx('info')}>
                    <div className={cx('row')}>
                        <FormGroup
                            labelTitle={'Mã nhân viên'}
                            idInput={'employeeId'}
                            readOnly={true}
                            valueInput={data.empId}
                            typeInput={'text'}
                        />
                        
                        <FormGroup
                            labelTitle={'Tên nhân viên'}
                            htmlForLabel={'employeeName'}
                            typeInput={'text'}
                            valueInput={data.empName}
                            idInput={'employeeName'}
                        />
                    </div>
                    <div className={cx('row')}>
                        <FormGroup
                            labelTitle={'CCCD'}
                            htmlForLabel={'employeeempCCCD'}
                            typeInput={'text'}
                            valueInput={data.empCCCD}
                            idInput={'employeeempCCCD'}
                        />

                        <FormGroup
                            labelTitle={'Ngày sinh'}
                            htmlForLabel={'employeeDob'}
                            typeInput={'date'}
                            valueInput={data.empDob}
                            idInput={'employeeDob'}
                        />
                    </div>
                    <div className={cx('row')}>
                        <div className={cx('form-group')}>
                            <label htmlFor="employeeempCCCD">Giới tính</label>
                            <div className={cx('form-group-item')}>
                                <label htmlFor="employeeMaleGender">Nam</label>
                                <input
                                    id="employeeMaleGender"
                                    name="gender"
                                    type="radio"
                                    value={'Nam'}
                                    checked={data.gender === 'Nam' ? true : false}
                                />
                                <label htmlFor="employeeFemaleGender">Nữ</label>
                                <input
                                    id="employeeFemaleGender"
                                    name="gender"
                                    type="radio"
                                    value={'Nữ'}
                                    checked={data.gender === 'Nữ' ? true : false}
                                />
                            </div>
                        </div>
                        <FormGroup
                            labelTitle={'Số điện thoại'}
                            htmlForLabel={'employeePhone'}
                            typeInput={'text'}
                            valueInput={data.empPhone}
                            idInput={'employeePhone'}
                        />
                    </div>
                    <FormGroup
                        labelTitle={'Địa chỉ'}
                        htmlForLabel={'employeeAddress'}
                        typeInput={'text'}
                        valueInput={data.empAddress}
                        idInput={'employeeAddress'}
                    />

                    <div className={cx('row')}>
                        <FormGroup
                            labelTitle={'Ngày vào làm'}
                            htmlForLabel={'employeeStartDate'}
                            typeInput={'date'}
                            valueInput={data.empStartDate}
                            idInput={'employeeStartDate'}
                        />

                        <FormGroup
                            labelTitle={'Mã kho'}
                            htmlForLabel={'warehouseId'}
                            typeInput={'text'}
                            valueInput={data.warehouseId}
                            idInput={'warehouseId'}
                        />
                    </div>
                    <div className={cx('row')}>
                        <FormGroup
                            labelTitle={'Chức vụ'}
                            htmlForLabel={'employeeRole'}
                            typeInput={'text'}
                            valueInput={data?.empRole ? data.empRole.map(role => formatRole[role.roleName]) : ""}
                            idInput={'employeeRole'}
                        >
                            <Tippy content={'Xem tất cả quyền'}>
                                <Eye size={22} className={cx('view-detail')} onClick={handleShowViewDetailRole} />
                            </Tippy>
                        </FormGroup>

                         <FormGroup
                            labelTitle={'Trạng thái'}
                            htmlForLabel={'employeeStatus'}
                            typeInput={'text'}
                            valueInput={data.empStatus}
                            idInput={'employeeStatus'}
                        />
                        
                    </div>
                    {data.empStatus == "Nghỉ việc" && <div className={cx('row')}>
                            <FormGroup
                            labelTitle={'Ngày nghỉ làm'}
                            htmlForLabel={'employeeEndDate'}
                            typeInput={'date'}
                            valueInput={data.empEndDate}
                            idInput={'employeeEndDate'}
                        />
                    </div>}
                </div>
            </div>

            <Modal isOpenInfo={viewDetailRole} onClose={handleShowViewDetailRole}>
                <div
                    className={cx('wrapper-role-employee')}
                >
                    <div className={cx('wrapper-view-role')}>
                        <h2>Các quyền truy cập hiện có</h2>
                        <div className={cx('view-role')}>
                            {listRoleUser.map((item, index) => (
                                <div className={cx('role-item')} key={index}>
                                    <span className={cx('role-title')}>{formatRole[item.roleName]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                   
                            {/* <ArrowRightLeft className={cx('icon-transfer')} size={22} />
                            <div className={cx('wrapper-list-role')}>
                                <h2>Danh sách các quyền truy cập</h2>
                                <div className={cx('list-role')}>
                                    {roleEmployee.map((item, index) => (
                                        <div className={cx('role-item')} key={index}>
                                            <input
                                                type="checkbox"
                                                value={item}
                                                checked={
                                                    data.empRole.find(role => formatRole[role.roleName] == item)
                                                }
                                            />
                                            <span className={cx('role-title')}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div> */}
                      
                </div>
            </Modal>
            
        </div>
    );
};

export default ModalReadEmployee;
