import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './BatchPage.module.scss';
import Button from '../../components/Button';
import { getAllShelfOfWarehouse } from '../../services/shelf.service';
import parseToken from '@/utils/parseToken';
import Tippy from '@tippyjs/react';
import BoxDetail from './BoxDetail';
import UpdateLocation from './UpdateLocation';
import ChangeLocation from './ChangeLocation';

const cx = classNames.bind(styles);

const BatchPage = () => {
    const [shelvesData, setShelvesData] = useState([]);
    const [selectedBox, setSelectedBox] = useState(null);
    const [showWareHouseTemp, setShowWareHouseTemp] = useState(false);
    const [showUpdateLocation, setShowUpdateLocation] = useState(false);
    const [showChangeLocation, setShowChangeLocation] = useState(false);
    const [batchesUpdate, setBatchesUpdate] = useState([]);
    const [batchesMove, setBatchesMove] = useState([]);

    const volumePercentage = (maxAcreage, remainingAcreage) => {
        const volume = (remainingAcreage / maxAcreage) * 100;
        if (volume == 100) return 'empty';
        if (volume >= 65) return 'ready';
        if (volume >= 30) return 'processing';
        else return 'warning';
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');

        const headers = {
            token: `Bearer ${token.accessToken}`,
            employeeID: token.employeeID,
            warehouseID: warehouse.warehouseID,
        };
        const data = await getAllShelfOfWarehouse({
            warehouseID: warehouse.warehouseID,
            headers,
        });
        if (data.status === 'OK') {
            setShelvesData(data.data);
        }
    };

    return (
        <div className={cx('warehouse-map')}>
            {/* BÊN TRÁI */}
            <div className={cx('left-panel')}>
                <div className={cx('packing-area')}>
                    <Button
                        onClick={() => {
                            setShowWareHouseTemp(true);
                        }}
                        className={cx('button')}
                    >
                        KHU VỰC KHO TẠM
                    </Button>
                </div>
            </div>

            {/* KHU CHÍNH */}
            <div className={cx('main-panel')}>
                {shelvesData.map((shelf) => {
                    return (
                        <div className={cx('shelf')} key={shelf.shelfID}>
                            {shelf.floor?.map((column, index) => {
                                return (
                                    <div className={cx('floor')} key={index}>
                                        {column.boxes.map((box, colIndex) => {
                                            return (
                                                <div onClick={() => setSelectedBox(box.boxID)} key={colIndex}>
                                                    <Tippy key={colIndex} content={`${box.boxName}`}>
                                                        <Button
                                                            className={cx([
                                                                'box',
                                                                volumePercentage(box.maxAcreage, box.remainingAcreage),
                                                            ])}
                                                        ></Button>
                                                    </Tippy>
                                                    <span>{box.boxID}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Mũi tên điều hướng */}
            <div className={cx('arrow')}></div>
            <div className={cx('arrow-2')}>
                <span>HƯỚNG DI CHUYỂN CỦA XE NÂNG</span>
            </div>
            <div className={cx('arrow-3')}>
                <span>HƯỚNG DI CHUYỂN CỦA XE NÂNG</span>
            </div>

            {/* BÊN DƯỚI */}
            <div className={cx('export-area')}>
                <Button
                    onClick={() => {
                        console.log(1);
                    }}
                    className={cx('button')}
                >
                    KHU VỰC HÀNG CHỜ XUẤT
                </Button>
            </div>
            <div className={cx('import-area')}>
                <Button
                    onClick={() => {
                        console.log(1);
                    }}
                    className={cx('button')}
                >
                    KHU VỰC CHỜ NHẬP HÀNG
                </Button>
            </div>
            <BoxDetail
                isOpen={!!selectedBox}
                onClose={() => setSelectedBox(null)}
                boxID={selectedBox}
                setBatchesUpdate={setBatchesMove}
                setShowChangeLocation={setShowChangeLocation}
            />
            <BoxDetail
                isOpen={showWareHouseTemp}
                onClose={() => setShowWareHouseTemp(false)}
                setShowUpdateLocation={setShowUpdateLocation}
                setBatchesUpdate={setBatchesUpdate}
            />
            <UpdateLocation
                isOpen={showUpdateLocation}
                onClose={() => setShowUpdateLocation(false)}
                batches={batchesUpdate}
                shelvesData={shelvesData}
                fetchData={fetchData}
            />
            <ChangeLocation
                isOpen={showChangeLocation}
                onClose={() => setShowChangeLocation(false)}
                batches={batchesMove}
                shelvesData={shelvesData}
                fetchData={fetchData}
            />
        </div>
    );
};

export default BatchPage;
