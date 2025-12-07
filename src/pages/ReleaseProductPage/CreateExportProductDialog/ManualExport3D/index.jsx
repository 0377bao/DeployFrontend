import { Button, Modal } from '../../../../components';
import classNames from 'classnames/bind';
import styles from './ManualExport3D.module.scss';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { styleMessage } from '../../../../constants';
import Shelf3D from '../../../../components/Shelf3D';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Plane } from '@react-three/drei';
import { getAllShelfOfWarehouse } from '../../../../services/shelf.service';
import parseToken from '../../../../utils/parseToken';
import { getAllBatchWithProductID } from '../../../../services/batch.service';
import { Trash2 } from 'lucide-react';

const cx = classNames.bind(styles);

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

const ManualExport3D = ({ isOpen, onClose, products, onConfirm, suggestedData }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [shelves, setShelves] = useState([]);
    const [inventory, setInventory] = useState([]); // Batches of selected product
    const [selectedExports, setSelectedExports] = useState([]); // Items selected for export
    const [conflictingBatches, setConflictingBatches] = useState([]); // For resolving multiple batches in one box
    const [targetBox, setTargetBox] = useState(null); // Box being clicked

    useEffect(() => {
        const warehouse = parseToken('warehouse');
        fetchShelves(warehouse.warehouseID);
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            fetchInventory(selectedProduct.productID, selectedProduct.unit.unitID);
        } else {
            setInventory([]);
        }
    }, [selectedProduct]);

    useEffect(() => {
        console.log(suggestedData);

        if (suggestedData && suggestedData.length > 0) {
            const initialExports = [];
            suggestedData.forEach((product) => {
                const productInfo = products.find((p) => p.productID === product.productID);
                if (product.batches) {
                    product.batches.forEach((batch) => {
                        if (batch.boxes) {
                            batch.boxes.forEach((box) => {
                                initialExports.push({
                                    productID: product.productID,
                                    batchID: batch.batchID,
                                    boxID: box.boxID,
                                    boxName: box.boxID,
                                    quantity: box.quantity,
                                    unit: productInfo?.unit?.unitName || '',
                                    available: box.quantity, // Initially assume available is at least what's suggested
                                    createdAt: batch.createdAt,
                                    expiryDate: batch.expiryDate,
                                });
                            });
                        }
                    });
                }
            });
            setSelectedExports(initialExports);

            // Auto select first product
            if (products.length > 0) {
                setSelectedProduct(products[0]);
            }
        }
    }, [suggestedData, products]);

    const fetchShelves = async (id) => {
        const token = parseToken('tokenUser');
        const headers = {
            token: `Bearer ${token.accessToken}`,
            employeeID: token.employeeID,
            warehouseID: id,
        };
        const res = await getAllShelfOfWarehouse({ warehouseID: id, headers });

        if (res.status === 'OK') {
            setShelves(res.data);
        }
    };

    const fetchInventory = async (productID, unitID) => {
        try {
            const res = await getAllBatchWithProductID(productID, unitID);

            if (res) {
                // Filter batches that have validAmount > 0
                const validBatches = res.filter((b) => b.validAmount > 0);
                console.log(validBatches);

                setInventory(validBatches);
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi tải thông tin lô hàng', styleMessage);
        }
    };

    const getShelfPosition = (index) => {
        const col = Math.floor(index / 10);
        const row = index % 10;
        const x = col * 5;
        const z = -(row * 8 - 37);
        return [x, 0, z];
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
    };

    const checkActive = (boxID) => {
        if (!selectedProduct) return false;
        return selectedExports.some((e) => e.boxID == boxID && e.productID === selectedProduct.productID);
    };

    const checkDisabled = (boxID) => {
        if (!selectedProduct) return true;

        const currentSelectedQty = selectedExports
            .filter((e) => e.productID === selectedProduct.productID)
            .reduce((acc, curr) => acc + curr.quantity, 0);
        const requiredQty = selectedProduct.amountRequiredExport;
        const isFull = currentSelectedQty >= requiredQty;

        const isSelected = checkActive(boxID);

        // Check if box is in inventory (contains the product)
        const hasProduct = inventory.some((batch) => {
            if (!batch.boxes) return false;
            if (Array.isArray(batch.boxes)) {
                return batch.boxes.some((bb) => bb.boxID == boxID);
            }
            return batch.boxes.boxID == boxID;
        });

        if (isFull) {
            return !isSelected;
        } else {
            return !hasProduct;
        }
    };

    const addBatchToExport = (batch, box) => {
        console.log(batch);

        // Get quantity in box
        let quantityInBox = 0;
        const bbEntry = batch.boxes.find((b) => b.boxID == box.boxID);
        const bb = bbEntry ? bbEntry.batch_boxes : null;

        quantityInBox = bb ? bb.validQuantity : 0;

        const currentSelectedQty = selectedExports
            .filter((e) => e.productID === selectedProduct.productID)
            .reduce((acc, curr) => acc + curr.quantity, 0);
        const requiredQty = selectedProduct.amountRequiredExport;
        const remainingNeeded = requiredQty - currentSelectedQty;

        const quantityToAdd = Math.min(quantityInBox, remainingNeeded);

        if (quantityToAdd <= 0) {
            toast.error('Đã đủ số lượng hoặc ô không có hàng khả dụng', styleMessage);
            return;
        }

        setSelectedExports((prev) => [
            ...prev,
            {
                productID: selectedProduct.productID,
                batchID: batch.batchID,
                boxID: box.boxID,
                boxName: box.boxID,
                quantity: quantityToAdd,
                unit: selectedProduct.unit.unitName,
                available: quantityInBox,
                createdAt: batch.createdAt,
                expiryDate: batch.expiryDate,
            },
        ]);
    };

    const handleBoxClick = (box) => {
        if (!selectedProduct) return;
        if (checkDisabled(box.boxID)) return;

        const isSelected = checkActive(box.boxID);

        if (isSelected) {
            // Deselect: Remove from selectedExports
            setSelectedExports((prev) =>
                prev.filter((e) => !(e.boxID == box.boxID && e.productID === selectedProduct.productID)),
            );
        } else {
            // Select
            const batchesInBox = inventory.filter((batch) => {
                if (!batch.boxes) return false;
                if (Array.isArray(batch.boxes)) {
                    return batch.boxes.some((bb) => bb.boxID == box.boxID);
                }
                return batch.boxes.boxID == box.boxID;
            });

            if (batchesInBox.length === 0) return;

            if (batchesInBox.length === 1) {
                addBatchToExport(batchesInBox[0], box);
            } else {
                // Multiple batches found, show selection modal
                setTargetBox(box);
                setConflictingBatches(batchesInBox);
            }
        }
    };

    const handleRemoveItem = (batchID, boxID) => {
        setSelectedExports((prev) =>
            prev.filter(
                (e) => !(e.batchID === batchID && e.boxID == boxID && e.productID === selectedProduct.productID),
            ),
        );
    };

    const handleQuantityChange = (batchID, boxID, value) => {
        const newQuantity = parseInt(value);
        if (isNaN(newQuantity)) return;

        // Find the item
        const item = selectedExports.find(
            (e) => e.batchID === batchID && e.boxID == boxID && e.productID === selectedProduct.productID,
        );
        if (!item) return;

        // Validation 1: Positive integer
        if (newQuantity <= 0) {
            toast.error('Số lượng phải là số nguyên dương', styleMessage);
            return;
        }

        // Validation 2: <= Available in box
        if (newQuantity > item.available) {
            toast.error(`Số lượng không được vượt quá tồn kho trong ô (${item.available})`, styleMessage);
            return;
        }

        // Validation 3: Total <= Required
        const currentTotal = selectedExports
            .filter((e) => e.productID === selectedProduct.productID)
            .reduce((acc, curr) => acc + curr.quantity, 0);
        const otherTotal = currentTotal - item.quantity;

        if (otherTotal + newQuantity > selectedProduct.amountRequiredExport) {
            toast.error(
                `Tổng số lượng xuất không được vượt quá yêu cầu (${selectedProduct.amountRequiredExport})`,
                styleMessage,
            );
            return;
        }

        // Update
        setSelectedExports((prev) =>
            prev.map((e) => {
                if (e.batchID === batchID && e.boxID == boxID && e.productID === selectedProduct.productID) {
                    return { ...e, quantity: newQuantity };
                }
                return e;
            }),
        );
    };

    const handleConfirm = () => {
        onConfirm(selectedExports);
        onClose();
    };

    const isAllSatisfied = products.every((product) => {
        const selectedQty = selectedExports
            .filter((e) => e.productID === product.productID)
            .reduce((acc, curr) => acc + curr.quantity, 0);
        return selectedQty >= product.amountRequiredExport;
    });

    return (
        <Modal
            isOpenInfo={isOpen}
            onClose={() => {
                onClose();
                setSelectedProduct(null);
                setSelectedExports([]);
            }}
            showButtonClose={false}
        >
            <div className={cx('wrapper')}>
                <div className={cx('update-info')}>
                    {/* Left: Product List */}
                    <div className={cx('batches-update')}>
                        <h3>Danh sách sản phẩm cần xuất</h3>
                        <div className={cx('tableWrap')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Mã SP</th>
                                        <th>Tên SP</th>
                                        <th>ĐVT</th>
                                        <th>Yêu cầu</th>
                                        <th>Đã chọn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => {
                                        const selectedQty = selectedExports
                                            .filter((e) => e.productID === product.productID)
                                            .reduce((acc, curr) => acc + curr.quantity, 0);

                                        return (
                                            <tr
                                                key={index}
                                                style={{
                                                    cursor: 'pointer',
                                                    background:
                                                        selectedProduct?.productID === product.productID
                                                            ? '#e6f7ff'
                                                            : 'transparent',
                                                }}
                                                onClick={() => handleProductSelect(product)}
                                            >
                                                <td>
                                                    <input
                                                        type="radio"
                                                        checked={selectedProduct?.productID === product.productID}
                                                        readOnly
                                                    />
                                                </td>
                                                <td>{product.productID}</td>
                                                <td className={cx('productName')}>{product.productName}</td>
                                                <td>{product.unit.unitName}</td>
                                                <td className={cx('num')}>{product.amountRequiredExport}</td>
                                                <td
                                                    className={cx('num')}
                                                    style={{
                                                        color:
                                                            selectedQty >= product.amountRequiredExport
                                                                ? 'green'
                                                                : 'red',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {selectedQty}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Center: Selected Batches for current product */}
                    <div className={cx('location-update')}>
                        <h3>Danh sách lô đã chọn ({selectedProduct?.productName})</h3>
                        <div className={cx('tableWrap')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th>Mã lô</th>
                                        <th>Ngày nhập</th>
                                        <th>HSD</th>
                                        <th>Vị trí</th>
                                        <th>Có sẵn</th>
                                        <th>Xuất</th>
                                        <th style={{ width: '40px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedExports
                                        .filter((item) => item.productID === selectedProduct?.productID)
                                        .map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.batchID}</td>
                                                <td>{formatDate(item.createdAt)}</td>
                                                <td>{formatDate(item.expiryDate)}</td>
                                                <td>{item.boxName || item.boxID}</td>
                                                <td className={cx('num')}>{item.available}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        min="0"
                                                        max={item.available}
                                                        onChange={(e) =>
                                                            handleQuantityChange(
                                                                item.batchID,
                                                                item.boxID,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button
                                                        className={cx('iconBtn')}
                                                        onClick={() => handleRemoveItem(item.batchID, item.boxID)}
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={cx('action')}>
                        <Button primary onClick={handleConfirm} disabled={!isAllSatisfied}>
                            Xác nhận xuất
                        </Button>
                    </div>
                </div>

                {/* Right: 3D View */}
                <div className={cx('shelf-update')}>
                    <div className={cx('main-panel')}>
                        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#f0f0f0' }}>
                            <Canvas camera={{ position: [0, 60, 120], fov: 50 }}>
                                <OrbitControls enableRotate={false} enableZoom enablePan />
                                <ambientLight intensity={0.6} />
                                <directionalLight position={[10, 30, 10]} intensity={1} castShadow />
                                <OrbitControls enablePan enableZoom enableRotate />
                                <Plane args={[60, 90]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                                    <meshStandardMaterial color="#ffffff" />
                                </Plane>

                                {shelves.map((shelf, idx) => (
                                    <Shelf3D
                                        key={shelf.shelfID}
                                        shelf={shelf}
                                        position={getShelfPosition(idx)}
                                        shelfType="exportProduct"
                                        onBoxSelect={handleBoxClick}
                                        checkDisabled={checkDisabled}
                                        checkActive={checkActive}
                                        shelfConfig={{ boxSpacing: 1.6, floorHeight: 4 }}
                                    />
                                ))}
                            </Canvas>
                        </div>
                    </div>
                </div>
            </div>

            {conflictingBatches.length > 0 && (
                <Modal
                    isOpenInfo={true}
                    onClose={() => {
                        setConflictingBatches([]);
                        setTargetBox(null);
                    }}
                    showButtonClose={false}
                >
                    <div style={{ padding: '10px', minWidth: '350px' }}>
                        <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', fontWeight: '600' }}>
                            Chọn lô hàng tại {targetBox?.boxID}
                        </h3>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                maxHeight: '60vh',
                                overflowY: 'auto',
                            }}
                        >
                            {conflictingBatches.map((batch) => {
                                const bbEntry = batch.boxes.find((b) => b.boxID == targetBox?.boxID);
                                const qty = bbEntry?.batch_boxes?.validQuantity || 0;
                                const isSelected = selectedExports.some(
                                    (e) =>
                                        e.batchID === batch.batchID &&
                                        e.boxID == targetBox?.boxID &&
                                        e.productID === selectedProduct.productID,
                                );

                                return (
                                    <div
                                        key={batch.batchID}
                                        style={{
                                            padding: '12px',
                                            border: isSelected ? '2px solid #1890ff' : '1px solid #ccc',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontSize: '1.3rem',
                                            backgroundColor: isSelected ? '#e6f7ff' : 'white',
                                        }}
                                        onClick={() => {
                                            if (isSelected) {
                                                handleRemoveItem(batch.batchID, targetBox.boxID);
                                            } else {
                                                addBatchToExport(batch, targetBox);
                                            }
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                readOnly
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 'bold' }}>{batch.batchID}</span>
                                                <span style={{ fontSize: '1.1rem', color: '#555' }}>
                                                    Ngày nhập: {formatDate(batch.createdAt)} - HSD:{' '}
                                                    {formatDate(batch.expiryDate)}
                                                </span>
                                            </div>
                                        </div>
                                        <span>SL: {qty}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <Button
                                outline
                                onClick={() => {
                                    setConflictingBatches([]);
                                    setTargetBox(null);
                                }}
                            >
                                Đóng
                            </Button>
                            <Button
                                primary
                                onClick={() => {
                                    setConflictingBatches([]);
                                    setTargetBox(null);
                                }}
                            >
                                Hoàn tất
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </Modal>
    );
};

export default ManualExport3D;
