import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './TableProductImport.module.scss';
import { Trash } from 'lucide-react';
import ModalUpdateDetailImportProduct from '../ModalUpdateDetailImportProduct';
import Button from '../Button';
import PopupMessage from '../PopupMessage';
import ModalUpdate from '../ModalUpdate';
import Modal from '../Modal';
import toast from 'react-hot-toast';
import { styleMessage } from '../../constants';
import request, { post } from '../../utils/httpRequest';

const cx = classNames.bind(styles);

const TableProductImport = ({
    title = 'Danh sách nhập hàng',
    products,
    updateCellData,
    clearRow,
    hasProposal = false,
    proposalSelected = false,
    suggestLocation,
    searchSupplier,
    searchProduct,
    addRow,
}) => {
    const [showDetail, setShowDetail] = useState(false);
    const [productSelected, setProductSelected] = useState(null);
    const [showPopupCreateSupplier, setShowPopupCreateSupplier] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const productRef = useRef(null); // dùng cho việc tìm nha cung cấp
    const [listUnitUOM, setListUnitUOM] = useState(false);

    const handleShowDetailModal = (idx) => {
        setProductSelected(idx);
        setShowDetail(true);
    };

    const handleSearchSupplier = async (idx, item) => {
        productRef.current = { idx, item };
        try {
            const res = await searchSupplier(item.supplierID);
            if (res) {
                item.supplierID = res.supplierID;
                item.supplierName = res.supplierName;
                updateCellData(idx, item);
                productRef.current = null;
            } else {
                setShowPopupConfirm(true);
            }
        } catch (err) {
            console.log(err);
            console.log(productRef.current);
            setShowPopupConfirm(true);
        }
    };

    const handleCreateSupplier = async (data) => {
        try {
            const tokenUser = JSON.parse(localStorage.getItem('tokenUser'));
            const res = await post(
                '/api/supplier',
                {
                    supplierID: data.supplierId,
                    supplierName: data.supplierName,
                    address: data.supplierAddress,
                    phoneNumber: data.supplierPhone,
                    email: data.supplierEmail,
                    status: 'ACTIVE',
                },
                tokenUser.accessToken,
                tokenUser.employeeID,
            );
            console.log('123' + res);
            if (res.status === 'ERR') {
                toast.error(res.message, styleMessage);
                console.log('123');
            } else {
                toast.success('Thêm nhà cung cấp thành công', styleMessage);
                productRef.current.item.supplierID = data.supplierId;
                productRef.current.item.supplierName = data.supplierName;
                updateCellData(productRef.current.idx, productRef.current.item);
                setShowPopupCreateSupplier(false);
            }
        } catch (error) {
            toast.error(
                Array.isArray(error.response.data.message)
                    ? error.response.data.message[0]
                    : error.response.data.message,
                styleMessage,
            );
            console.log(error);
        }
    };

    const handleSearchProduct = async (idx, item) => {
        try {
            const res = await searchProduct(item.productID);
            if (res) {
                item.productID = res.productID;
                item.productName = res.productName;
                updateCellData(idx, item);
            }
        } catch (err) {
            console.log(err);
            toast.error('Sản phẩm không tồn tại', styleMessage);
        }
    };

    const columnCreate = [
        {
            id: 1,
            label: 'Mã NCC',
            name: 'supplierId',
            pattern: null,
            message: '',
            readOnly: true,
        },
        {
            id: 2,
            label: 'Tên nhà cung cấp',
            name: 'supplierName',
            pattern: null,
            message: '',
            readOnly: false,
        },
        {
            id: 3,
            label: 'SDT',
            name: 'supplierPhone',
            pattern: /^(03|07|08|09)\d{8}/,
            message: 'Số điện thoại phải bắt đầu bằng 03 hoặc 07 hoặc 08 hoặc 09 và có độ dài tối đa 10 chữ số',
            readOnly: false,
        },
        {
            id: 4,
            label: 'Địa chỉ',
            name: 'supplierAddress',
            pattern: null,
            message: '',
            readOnly: false,
        },
        {
            id: 5,
            label: 'Email',
            name: 'supplierEmail',
            pattern: /^\w+@\w+(.com|.vn)$/,
            message: 'Email không hợp lệ',
            readOnly: false,
        },
    ];

    useEffect(() => {
        const fetchUnitUOM = async () => {
            try {
                const res = await request.get('/api/unit/get-all');
                const formatUnitUOM = res.data.data.map((it) => ({ unitID: it.unitID, unitName: it.unitName }));
                setListUnitUOM(formatUnitUOM);
            } catch (err) {
                console.log(err);
            }
        };
        fetchUnitUOM();
    }, []);

    return (
        <section className={cx('product-receive-list')}>
            <div className={cx('header')}>
                <h2>{title}</h2>
                {!hasProposal && (
                    <Button primary small onClick={addRow}>
                        <span>Thêm dòng</span>
                    </Button>
                )}
            </div>
            <table className={cx('table')}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã lô</th>
                        <th>Mã nhà cung cấp</th>
                        <th>Tên nhà cung cấp</th>
                        <th>Mã sản phẩm</th>
                        <th>Tên sản phẩm</th>
                        <th>Đơn vị tính</th>
                        <th>Thêm chi tiết</th>
                        {!hasProposal && <th>Xoá</th>}
                    </tr>
                </thead>
                <tbody>
                    {hasProposal && proposalSelected
                        ? products.map((it, idx) => {
                              return (
                                  <tr key={idx}>
                                      <td>{idx + 1}</td>
                                      <td>
                                          <input
                                              type="text"
                                              placeholder="Nhập mã lô"
                                              value={it.batchID ?? ''}
                                              onChange={(e) => {
                                                  it.batchID = e.target.value;
                                                  updateCellData(idx, it);
                                              }}
                                          />
                                      </td>
                                      <td className={cx('td-custom')}>
                                          <input
                                              type="text"
                                              placeholder="Nhập mã nhà cung cấp"
                                              value={it.supplierID ?? ''}
                                              onChange={(e) =>
                                                  updateCellData(idx, { ...it, supplierID: e.target.value })
                                              }
                                          />
                                          <Button primary small onClick={() => handleSearchSupplier(idx, it)}>
                                              <span>Tìm</span>
                                          </Button>
                                      </td>
                                      <td>
                                          <input
                                              type="text"
                                              placeholder="Nhập tên nhà cung cấp"
                                              value={it.supplierName ?? ''}
                                              readOnly
                                          />
                                      </td>
                                      <td>
                                          <input
                                              type="text"
                                              placeholder="Nhập mã sản phẩm"
                                              value={it.productID ?? ''}
                                              readOnly
                                          />
                                      </td>
                                      <td>
                                          <input
                                              type="text"
                                              placeholder="Nhập tên sản phẩm"
                                              value={it.productName ?? ''}
                                              readOnly
                                          />
                                      </td>
                                      <td>
                                          <input
                                              type="text"
                                              placeholder="Nhập đơn vị tính"
                                              value={it.unit.unitName ?? ''}
                                              readOnly
                                          />
                                      </td>
                                      <td>
                                          <Button primary small onClick={() => handleShowDetailModal(idx)}>
                                              <span>Thêm</span>
                                          </Button>
                                      </td>
                                  </tr>
                              );
                          })
                        : products.map((it, idx) => {
                              return (
                                  <tr key={idx}>
                                      <td>{idx + 1}</td>
                                      <td>
                                          <input
                                              type="text"
                                              placeholder="Nhập mã lô"
                                              value={it.batchID ?? ''}
                                              onChange={(e) => {
                                                  it.batchID = e.target.value;
                                                  updateCellData(idx, it);
                                              }}
                                          />
                                      </td>
                                      <td className={cx('td-custom')}>
                                          <input
                                              type="text"
                                              placeholder="Nhập mã nhà cung cấp"
                                              value={it.supplierID ?? ''}
                                              onChange={(e) =>
                                                  updateCellData(idx, { ...it, supplierID: e.target.value })
                                              }
                                          />
                                          <Button primary small onClick={() => handleSearchSupplier(idx, it)}>
                                              <span>Tìm</span>
                                          </Button>
                                      </td>
                                      <td>
                                          <input
                                              type="text"
                                              placeholder="Nhập tên nhà cung cấp"
                                              value={it.supplierName ?? ''}
                                              readOnly
                                          />
                                      </td>
                                      <td className={cx('td-custom')}>
                                          <input
                                              type="text"
                                              placeholder="Nhập mã sản phẩm"
                                              value={it.productID ?? ''}
                                              onChange={(e) =>
                                                  updateCellData(idx, { ...it, productID: e.target.value })
                                              }
                                          />
                                          <Button primary small onClick={() => handleSearchProduct(idx, it)}>
                                              <span>Tìm</span>
                                          </Button>
                                      </td>
                                      <td>
                                          <input
                                              type="text"
                                              placeholder="Nhập tên sản phẩm"
                                              value={it.productName ?? ''}
                                              readOnly
                                          />
                                      </td>
                                      <td>
                                          <select
                                              onChange={(e) => updateCellData(idx, { ...it, unit: e.target.value })}
                                              value={it.unit ?? ''}
                                          >
                                              <option disabled value={''} selected>
                                                  --Chọn đơn vị tính--
                                              </option>
                                              {listUnitUOM.length > 0 &&
                                                  listUnitUOM.map((op, index) => (
                                                      <option key={index} value={op.unitID}>
                                                          {op.unitName}
                                                      </option>
                                                  ))}
                                          </select>
                                      </td>
                                      <td>
                                          <Button primary small onClick={() => handleShowDetailModal(idx)}>
                                              <span>Thêm</span>
                                          </Button>
                                      </td>
                                      <td>
                                          <Trash size={20} color={'red'} onClick={() => clearRow(idx)} />
                                      </td>
                                  </tr>
                              );
                          })}
                </tbody>
            </table>
            <ModalUpdateDetailImportProduct
                isOpen={showDetail}
                item={products[productSelected]}
                indexItem={productSelected}
                suggestLocation={suggestLocation}
                updateCellData={updateCellData}
                onClose={setShowDetail}
                hasProposal={hasProposal}
            />
            {showPopupConfirm && (
                <PopupMessage>
                    <div className={cx('wrapper-message')}>
                        <h1>Thông báo</h1>
                        <p className={cx('des')}>Nhà cung cấp này không tồn tại. {'\n'} Vui lòng tạo mới!</p>
                        <div className={cx('action-confirm')}>
                            <Button
                                primary
                                onClick={() => {
                                    setShowPopupConfirm(false);
                                    setShowPopupCreateSupplier(true);
                                }}
                            >
                                <span>Thêm mới</span>
                            </Button>
                        </div>
                    </div>
                </PopupMessage>
            )}
            {showPopupCreateSupplier && (
                <Modal showButtonClose={false} isOpenInfo={showPopupCreateSupplier} onClose={() => {}}>
                    <ModalUpdate
                        columns={columnCreate}
                        label={'Thêm mới nhà cung cấp'}
                        onClose={() => {}}
                        onSubmit={handleCreateSupplier}
                        showCancel={false}
                        defaultValue={{
                            supplierId: productRef.current.item.supplierID,
                        }}
                    />
                </Modal>
            )}
        </section>
    );
};

export default TableProductImport;
