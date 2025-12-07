import { Button, Modal, MyTable } from '../../../components';
import classNames from 'classnames/bind';
import styles from './UpdateLocation.module.scss';
import Tippy from '@tippyjs/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { updateLocationBatch } from '../../../services/batchBox.service';
import parseToken from '../../../utils/parseToken';
const cx = classNames.bind(styles);

const UpdateLocation = ({ isOpen, onClose, shelvesData, batches, fetchData }) => {
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [locations, setLocations] = useState([]);
    const [localBatches, setLocalBatches] = useState([]);
    const [localShelves, setLocalShelves] = useState([]);

    useEffect(() => {
        setLocations(batches.map((item) => ({ batchID: item.batchID, locations: [] })));
        setLocalBatches(batches.map((b) => ({ ...b })));
        setLocalShelves(shelvesData.map((s) => ({ ...s })));
    }, [batches, shelvesData]);

    useEffect(() => {
        console.log('locations ', locations);
    }, [locations]);

    const handleCheckboxChange = (batchID) => {
        setSelectedBatch(batchID);
    };

    const handleClickBox = (box) => {
        if (selectedBatch) {
            const batchLocation = locations.find((item) => item.batchID == selectedBatch);
            const batchFind = localBatches.find((item) => item.batchID === selectedBatch);
            const totalVolume = batchFind.unit.length * batchFind.unit.width * batchFind.unit.height;

            if (!batchLocation?.locations?.find((loc) => loc.boxID === box.boxID)) {
                const quantityCanAdd = Math.floor(box.remainingAcreage / totalVolume);
                let boxToAdd;
                let acreage;

                if (quantityCanAdd > batchFind.remainAmount) {
                    boxToAdd = { ...box, quantity: batchFind.remainAmount };
                    acreage = batchFind.remainAmount * totalVolume;
                    setLocalBatches((prevBatches) =>
                        prevBatches.map((b) => (b.batchID === selectedBatch ? { ...b, remainAmount: 0 } : b)),
                    );
                } else {
                    boxToAdd = { ...box, quantity: quantityCanAdd };
                    acreage = quantityCanAdd * totalVolume;
                    setLocalBatches((prevBatches) =>
                        prevBatches.map((b) =>
                            b.batchID === selectedBatch ? { ...b, remainAmount: b.remainAmount - quantityCanAdd } : b,
                        ),
                    );
                }
                setLocalShelves((prevShelves) =>
                    prevShelves.map((shelf) => ({
                        ...shelf,
                        floor: shelf.floor.map((col) => ({
                            ...col,
                            boxes: col.boxes.map((b) =>
                                b.boxID === box.boxID ? { ...b, remainingAcreage: b.remainingAcreage - acreage } : b,
                            ),
                        })),
                    })),
                );
                // Nếu chưa có thì thêm
                setLocations((prevLocations) =>
                    prevLocations.map((item) =>
                        item.batchID === selectedBatch ? { ...item, locations: [...item.locations, boxToAdd] } : item,
                    ),
                );
            } else {
                const quantityCanAdd = batchLocation.locations.find((loc) => loc.boxID === box.boxID).quantity;

                setLocalShelves((prevShelves) =>
                    prevShelves.map((shelf) => ({
                        ...shelf,
                        floor: shelf.floor.map((col) => ({
                            ...col,
                            boxes: col.boxes.map((b) =>
                                b.boxID === box.boxID
                                    ? { ...b, remainingAcreage: b.remainingAcreage + quantityCanAdd * totalVolume }
                                    : b,
                            ),
                        })),
                    })),
                );
                // Cập nhật lại số lượng trong lô
                setLocalBatches((prevBatches) =>
                    prevBatches.map((b) =>
                        b.batchID === selectedBatch ? { ...b, remainAmount: b.remainAmount + quantityCanAdd } : b,
                    ),
                );
                // Nếu có rồi thì xóa ra
                setLocations((prevLocations) =>
                    prevLocations.map((item) =>
                        item.batchID === selectedBatch
                            ? { ...item, locations: item.locations.filter((loc) => loc.boxID !== box.boxID) }
                            : item,
                    ),
                );
            }
        }
    };

    const handleOnclose = () => {
        setSelectedBatch(null);
        onClose();
    };

    const checkBoxExists = (boxID) => {
        const locationFind = locations.find((item) => item.batchID === selectedBatch);
        const found = locationFind?.locations.find((loc) => loc.boxID === boxID);
        if (found) return true;

        return false;
    };

    const checkEnoughCoverage = (box) => {
        const found = localBatches.find((item) => item.batchID === selectedBatch);
        if (found?.unit?.length * found?.unit?.width * found?.unit?.height <= box.remainingAcreage) {
            return true;
        }

        return false;
    };

    const checkTotalQuantity = (box) => {
        const found = localBatches.find((item) => item.batchID === selectedBatch);
        if (found?.remainAmount == 0 && !checkBoxExists(box.boxID)) {
            return true;
        }

        return false;
    };

    const handleUpdateLocation = async () => {
        for (const item of locations) {
            const batchFind = localBatches.find((b) => b.batchID === item.batchID);
            if (batchFind?.remainAmount > 0) {
                toast.error(
                    `Lô ${item.batchID} còn ${batchFind?.remainAmount} sản phẩm chưa được phân bổ`,
                    styleMessage,
                );
                return; // lúc này return sẽ thoát hẳn khỏi handleUpdateLocation
            }
        }

        const locationToUpdate = locations.map((item) => ({
            batchID: item.batchID,
            boxes: item.locations.map((loc) => ({ boxID: loc.boxID, quantity: loc.quantity })),
        }));

        const warehouseID = parseToken('warehouse').warehouseID;
        const res = await updateLocationBatch(warehouseID, locationToUpdate);

        if (res.data.status === 'OK') {
            console.log(1);

            toast.success('Cập nhật vị trí thành công', styleMessage);
            fetchData();
            onClose();
        }
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={handleOnclose} showButtonClose={false}>
            <div className={cx('wrapper')}>
                <div className={cx('update-info')}>
                    <div className={cx('batches-update')}>
                        <h3>Danh sách lô hàng</h3>
                        <div className={cx('tableWrap')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th className={cx('stt')}>Mã lô</th>
                                        <th className={cx('productName')}>Tên sản phẩm</th>
                                        <th className={cx('unit')}>Đơn vị tính</th>
                                        <th className={cx('unit')}>Thể tích</th>
                                        <th className={cx('num')}>Số lượng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batches?.map((batch, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="radio"
                                                    checked={selectedBatch === batch.batchID}
                                                    onChange={() => handleCheckboxChange(batch.batchID)}
                                                />
                                            </td>
                                            <td className={cx('stt')}>{batch.batchID}</td>
                                            <td className={cx('productName')}>{batch.product.productName}</td>
                                            <td className={cx('unit')}>{batch.unit.unitName}</td>
                                            <td className={cx('unit')}>
                                                {batch.unit.length * batch.unit.width * batch.unit.height}
                                            </td>
                                            <td className={cx('num')}>{batch.remainAmount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className={cx('location-update')}>
                        <h3>Danh sách vị trí</h3>
                        <div className={cx('tableWrap')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th className={cx('stt')}>Vị trí</th>
                                        <th className={cx('productID')}>Thể tích còn lại</th>
                                        <th className={cx('productName')}>Số lượng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locations
                                        .find((item) => item.batchID === selectedBatch)
                                        ?.locations?.map((location, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td className={cx('stt')}>{location.boxName}</td>
                                                    <td className={cx('productID')}>{location.remainingAcreage}</td>
                                                    <td className={cx('productName')}>
                                                        <input value={location.quantity} type="number" min="0" />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className={cx('action')}>
                        <Button primary onClick={handleUpdateLocation}>
                            Cập nhật vị trí
                        </Button>
                    </div>
                </div>
                <div className={cx('shelf-update')}>
                    {/* KHU CHÍNH */}
                    <div className={cx('main-panel')}>
                        {localShelves.map((shelf) => {
                            return (
                                <div className={cx('shelf')} key={shelf.shelfID}>
                                    {shelf.floor?.map((column, index) => {
                                        return (
                                            <div className={cx('floor')} key={index}>
                                                {column.boxes.map((box, colIndex) => {
                                                    return (
                                                        <div>
                                                            <Tippy key={colIndex} content={`${box.boxName}`}>
                                                                <Button
                                                                    onClick={() => handleClickBox(box)}
                                                                    disabled={
                                                                        !selectedBatch ||
                                                                        (!checkEnoughCoverage(box) &&
                                                                            !checkBoxExists(box.boxID)) ||
                                                                        checkTotalQuantity(box)
                                                                    }
                                                                    className={cx([
                                                                        'box',
                                                                        checkBoxExists(box.boxID) && 'active',
                                                                        checkEnoughCoverage(box) && 'ready',
                                                                        checkBoxExists(box.boxID) && 'ready',
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
                </div>
            </div>
        </Modal>
    );
};

export default UpdateLocation;
