import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalUpdateDetailImportProduct.module.scss';
import Modal from '../Modal';
import toast from 'react-hot-toast';
import { styleMessage } from '../../constants';
import Button from '../Button';
import MyTable from '../MyTable';
import request from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';

const cx = classNames.bind(styles);

const ModalUpdateDetailImportProduct = ({ indexItem, item = {
    batchID: '',
    productID: '',
    productName: '',
    unit: '',
    requestAmount: '',
    realAmount: '',
    errorAmount: '',
    location: '',
    reasonError: '',
    supplierID: '',
    manufactureDate: "",
    expiryDate: ""
}, isOpen, onClose, updateCellData, suggestLocation, hasProposal = false }) => {
    const [selectedRows, setSelectedRows] = useState(null)
    const [locationSuggest, setLocationSuggest] = useState([])
    const handleApplyDetail = () => {
        if(!item.realAmount) {
            toast.error("Vui lòng nhập số lượng thực tế", styleMessage)
            return;
        }
        onClose(false)
    }


    // fetch data
        const fetchData = async () => {
           try{
            const token = parseToken("tokenUser")   
            const warehouse = parseToken("warehouse")
                const res = await request.get(`/api/batch-box/suggest-boxes`, {
                    params: {
                        warehouseID: warehouse.warehouseID,
                        productID: item.productID
                    },
                    headers: {
                        token: `Beare ${token.accessToken}`,
                        employeeid: token.employeeID,
                    }
                })
                console.log(res.data)
                setLocationSuggest(res.data.boxes)
           }catch(err) {
            console.log(err)
           } 
        }
        

    const columns = [
        {
            title: 'Tên khu vực',
            dataIndex: "zoneID",
            key: 'zoneID',
            render: (_, record) => <p>{record.floor.shelf.zone.zoneName}</p> 
        },
         {
            title: 'Tên kệ',
            dataIndex: "shelfID",
            key: 'shelfID',
            render: (_, record) => <p>{record.floor.shelf.shelfName}</p> 
        },
         {
            title: 'Tên tầng',
            dataIndex: "floorID",
            key: 'floorID',
            render: (_, record) => <p>{record.floor.floorName}</p> 
        },
         {
            title: 'Tên ô',
            dataIndex: "boxID",
            key: 'boxID',
            render: (_, record) => <p>{record.boxName}</p>
        }
    ]

    const rowSelection = {
        type: 'checkbox',
        selectedRowKeys: selectedRows,
        onChange: (newSelectedRowKey) => {
            setSelectedRows(newSelectedRowKey)
        }
    }

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('wrapper-detail-import-product-content')}>
                <p className={cx('title-header')}>Cập nhật chi tiết lô hàng</p>
                <div className={cx('row')}>
                    <div className={cx('form-group')}>
                    <label>Ngày sản xuất</label>
                    <input value={item.manufactureDate} type='date' placeholder='Nhập ngày sản xuất' onChange={(e) => {
                        if(new Date(e.target.value) >= Date.now()) {
                            toast.error('Ngày sản xuất phải trước ngày hôm nay', styleMessage)
                        }else {
                            updateCellData(
                            indexItem, {...item, manufactureDate: e.target.value})}
                        }
                    }/>
                </div>
                <div className={cx('form-group')}>
                    <label>Hạn sử dụng</label>
                    <input value={item.expiryDate} type='date' placeholder='Nhập hạn sử dụng' onChange={(e) => {
                        if(new Date(e.target.value) <= Date.now()) {
                            toast.error('Hạn sử dụng phải sau ngày hôm nay', styleMessage)
                        }else {
                            updateCellData(indexItem, {...item, expiryDate: e.target.value})
                        }
                    }}/>
                </div>
                </div>

                <div className={cx('row')}>
                    <div className={cx('form-group')}>
                        <label>Số lượng yêu cầu</label>
                        <input
                            type="number"
                            placeholder="Số lượng yêu cầu"
                            value={item.requestAmount}    
                            readOnly
                        />
                    </div>
                     
                    <div className={cx('form-group')}>
                    <label>Số lượng thực tế</label>
                        <input
                            type="number"
                            placeholder="Số lượng thực tế"
                            min={1}
                            value={item.realAmount}
                            onChange={(e) => {
                                const raw = e.target.value.trim()
                                const num = Number.parseInt(e.target.value, 10)
                               
                                if(raw === "") {
                                     item.realAmount = raw 
                                    updateCellData(indexItem, item)
                                    setLocationSuggest([])
                                }  
                                else {
                                    const errorAmount = Number.parseInt(item.requestAmount) - Number.parseInt(raw)
                                    if(errorAmount < 0) {
                                        toast.error('Số lượng thực tế vượt mức yêu cầu ' + item.requestAmount, styleMessage)
                                    }else {
                                        fetchData();
                                        item.realAmount = isNaN(num) ? undefined : num 
                                        if(hasProposal)
                                            item.errorAmount = errorAmount
                                        updateCellData(indexItem, item)
                                    }
                                    
                                }
                            }}
                        />
                    </div>
             
                    
                </div>
                <div className={cx('row')}>
                    {hasProposal && <div className={cx('form-group')}>
                        <label>Số lượng thiếu</label>
                        <input
                            type="number"
                            placeholder="Số lượng thiếu"
                            min={1}
                            value={item.errorAmount}    
                            readOnly
                        />
                    </div>}
                    {hasProposal && <div className={cx('form-group')}>
                    <label>Lý do thiếu</label>
                    <input type="text" placeholder="Nhập lý do" value={item.reasonError || ""} onChange={(e) => {
                        item.reasonError = e.target.value
                        updateCellData(indexItem, item)}}/>
                </div>}
                </div>
                
               <div className={cx('suggest-location-view')}>
                    <p>Danh sách gợi ý vị trí lưu trữ lô hàng</p>
                    <MyTable columns={columns} data={locationSuggest} rowSelection={rowSelection}/>
                </div>
                <div className={cx('action-modal')}>
                    <Button success onClick={handleApplyDetail}>
                        <span>Cập nhật</span>
                    </Button>
                    <Button primary onClick={handleApplyDetail}>
                        <span>Đóng</span>
                    </Button>
                </div>
                
            </div>
        </Modal>
    );
};

export default ModalUpdateDetailImportProduct;
