import { Button, Modal, MyTable } from '../../../components';
import classNames from 'classnames/bind';
import styles from './ChangeLocation.module.scss';
import Tippy from '@tippyjs/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../constants';
import { changeLocationBatch, updateLocationBatch } from '../../../services/batchBox.service';
import parseToken from '../../../utils/parseToken';
const cx = classNames.bind(styles);

const ChangeLocation = ({ isOpen, onClose, shelvesData, batches, fetchData }) => {
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [locations, setLocations] = useState([]);
    const [localBatches, setLocalBatches] = useState([]);
    const [localShelves, setLocalShelves] = useState([]);

    console.log('batches', batches);

    useEffect(() => {
        setLocations(batches?.batches?.map((item) => ({ batchID: item.batchID, locations: [] })) || []);
        setLocalBatches(batches?.batches?.map((b) => ({ ...b })) || []);
        setLocalShelves(shelvesData?.map((s) => ({ ...s })));
    }, [batches, shelvesData]);

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

                if (quantityCanAdd > batchFind.batch_boxes.quantity) {
                    boxToAdd = { ...box, quantity: batchFind.batch_boxes.quantity };
                    acreage = batchFind.batch_boxes.quantity * totalVolume;
                    setLocalBatches((prevBatches) =>
                        prevBatches.map((b) =>
                            b.batchID === selectedBatch ? { ...b, batch_boxes: { quantity: 0 } } : b,
                        ),
                    );
                } else {
                    boxToAdd = { ...box, quantity: quantityCanAdd };
                    acreage = quantityCanAdd * totalVolume;
                    setLocalBatches((prevBatches) =>
                        prevBatches.map((b) =>
                            b.batchID === selectedBatch
                                ? { ...b, batch_boxes: { quantity: b.batch_boxes.quantity - quantityCanAdd } }
                                : b,
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
                        b.batchID === selectedBatch
                            ? { ...b, batch_boxes: { quantity: b.batch_boxes.quantity + quantityCanAdd } }
                            : b,
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
        if (found?.batch_boxes?.quantity == 0 && !checkBoxExists(box.boxID)) {
            return true;
        }

        return false;
    };

    const handleChangeInputQuantity = (boxID, value) => {
        const batchLocation = locations.find((item) => item.batchID == selectedBatch);
        const batchFind = localBatches.find((item) => item.batchID === selectedBatch);
        const locationFind = batchLocation.locations.find((loc) => loc.boxID === boxID);

        const boxFind = localShelves
            .flatMap((shelf) => shelf.floor)
            .flatMap((col) => col.boxes)
            .find((b) => b.boxID === boxID);
        const totalVolume = batchFind.unit.length * batchFind.unit.width * batchFind.unit.height;
        let newQuantity = parseInt(value);
        const quantityDiff = newQuantity - locationFind.quantity;
        const acreageDiff = quantityDiff * totalVolume;
        console.log('batchFind.batch_boxes.quantity', batchFind.batch_boxes.quantity);

        if (isNaN(newQuantity)) {
            toast.error('Số lượng không hợp lệ', styleMessage);
            return;
        } else if (newQuantity <= 0) {
            toast.error('Số lượng phải lớn hơn 0', styleMessage);
            return;
        } else if (quantityDiff > batchFind.batch_boxes.quantity) {
            toast.error(
                `Số lượng vượt quá số lượng còn lại của lô cần chuyển (${batchFind.batch_boxes.quantity})`,
                styleMessage,
            );
            return;
        }

        if (newQuantity * totalVolume > boxFind.remainingAcreage + locationFind.quantity * totalVolume) {
            toast.error(`Số lượng vượt quá số lượng còn lại của ô có thể chứa`, styleMessage);
            return;
        }
        // Cập nhật lại số lượng trong lô
        setLocalBatches((prevBatches) =>
            prevBatches.map((b) =>
                b.batchID === selectedBatch
                    ? { ...b, batch_boxes: { quantity: b.batch_boxes.quantity - quantityDiff } }
                    : b,
            ),
        );
        // Cập nhật lại diện tích trong kho
        setLocalShelves((prevShelves) =>
            prevShelves.map((shelf) => ({
                ...shelf,
                floor: shelf.floor.map((col) => ({
                    ...col,
                    boxes: col.boxes.map((b) =>
                        b.boxID === boxID ? { ...b, remainingAcreage: b.remainingAcreage - acreageDiff } : b,
                    ),
                })),
            })),
        );
        // // Cập nhật lại số lượng trong vị trí
        setLocations((prevLocations) =>
            prevLocations.map((item) =>
                item.batchID === selectedBatch
                    ? {
                          ...item,
                          locations: item.locations.map((loc) =>
                              loc.boxID === boxID ? { ...loc, quantity: newQuantity } : loc,
                          ),
                      }
                    : item,
            ),
        );
    };

    const handleUpdateLocation = async () => {
        const locationToUpdate = locations.map((item) => ({
            batchID: item.batchID,
            boxes: item.locations.map((loc) => ({ boxID: loc.boxID, quantity: loc.quantity })),
        }));

        const oldLocations = localBatches.map((item) => ({
            batchID: item.batchID,
            quantity: item.batch_boxes.quantity,
        }));

        const newLocations = locationToUpdate.map((item) => ({
            batchID: item.batchID,
            boxes: item.boxes.map((box) => ({ boxID: box.boxID, quantity: box.quantity })),
        }));

        const res = await changeLocationBatch({
            oldLocations,
            newLocations,
            boxID: batches.boxID,
        });

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
                        <h3>
                            Danh sách lô hàng chuyển từ: <i className={cx('location')}>{batches.location}</i>
                        </h3>
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
                                    {batches?.batches?.map((batch, index) => (
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
                                            <td className={cx('num')}>{batch.batch_boxes?.quantity}</td>
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
                                        <th className={cx('productID')}>Thể tích tiêu hao</th>
                                        <th className={cx('productName')}>Số lượng chuyển</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locations
                                        .find((item) => item.batchID === selectedBatch)
                                        ?.locations?.map((location, index) => {
                                            const unit = localBatches.find((b) => b.batchID === selectedBatch)?.unit;
                                            const totalVolume = unit.length * unit.width * unit.height;
                                            return (
                                                <tr key={index}>
                                                    <td className={cx('stt')}>{location.boxName}</td>
                                                    <td className={cx('productID')}>{location.remainingAcreage}</td>
                                                    <td className={cx('productID')}>
                                                        {location.quantity * totalVolume}
                                                    </td>
                                                    <td className={cx('productName')}>
                                                        <input
                                                            value={location.quantity}
                                                            type="number"
                                                            min="0"
                                                            onChange={(e) => {
                                                                handleChangeInputQuantity(
                                                                    location.boxID,
                                                                    e.target.value,
                                                                );
                                                            }}
                                                        />
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
                                                                        checkTotalQuantity(box) ||
                                                                        batches.boxID === box.boxID
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

export default ChangeLocation;
