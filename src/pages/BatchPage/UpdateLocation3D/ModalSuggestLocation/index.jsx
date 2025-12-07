import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalSuggestLocation.module.scss';
import { Modal, Button } from '@/components';
import { suggestBoxes } from '../../../../services/batchBox.service';
import toast from 'react-hot-toast';
import { Info } from 'lucide-react';
import { styleMessage } from '../../../../constants';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import Tippy from '@tippyjs/react';
const cxGlobal = classNames.bind(globalStyle);

const cx = classNames.bind(styles);

const ModalSuggestLocation = ({ batches, isOpen, onClose, handleSuggestLocationSubmit }) => {
    const [typeFilter, setTypeFilter] = useState({
        locationScore: 0,
        expiredScore: 0,
        unitScore: 0,
        productSimilarityScore: 0,
        enoughAcreageScore: 0,
    });

    const objectPriority = [
        { name: 'Không ưu tiên', value: 0 },
        { name: 'Độ ưu tiên 1', value: 1 },
        { name: 'Độ ưu tiên 2', value: 0.5 },
        { name: 'Độ ưu tiên 3', value: 0.25 },
    ];

    const handleReset = () => {
        setTypeFilter({
            locationScore: 0,
            expiredScore: 0,
            unitScore: 0,
            productSimilarityScore: 0,
            enoughAcreageScore: 0,
        });
    };

    const handleSuggestLocation = async () => {
        if (
            typeFilter.locationScore === 0 &&
            typeFilter.expiredScore === 0 &&
            typeFilter.unitScore === 0 &&
            typeFilter.productSimilarityScore === 0 &&
            typeFilter.enoughAcreageScore === 0
        ) {
            toast.error('Vui lòng chọn ít nhất một tiêu chí ưu tiên để gợi ý vị trí!', styleMessage);
            return;
        }
        const batchIDs = batches.map((batch) => batch.batchID);
        const payload = {
            batchIDs,
            ...typeFilter,
        };
        const res = await suggestBoxes(payload);
        if (res.data?.status === 'OK') {
            handleSuggestLocationSubmit(res.data.data);
            onClose();
        }
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('wrapper')}>
                <div className={cx('wrapper-table')}>
                    <div className={cx('form-group')}>
                        <label htmlFor="locationScore">
                            <span>Ưu tiên theo vị trí kệ</span>
                            <Tippy
                                content={'Ưu tiên các vị trí kệ dễ tiếp cận, thuận tiện cho việc nhập – xuất hàng.'}
                                placement="right"
                            >
                                <span className={cx('action-table-icon')} onClick={() => {}}>
                                    <Info size={18} />
                                </span>
                            </Tippy>
                        </label>
                        <select
                            id="locationScore"
                            value={typeFilter.locationScore}
                            onChange={(e) => {
                                setTypeFilter({ ...typeFilter, locationScore: e.target.value });
                            }}
                        >
                            <option disabled></option>
                            {objectPriority.map((opt) => (
                                <option key={opt.name} value={opt.value}>
                                    {opt.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="expiredScore">
                            <span>Ưu tiên theo hạn sử dụng</span>
                            <Tippy
                                content={
                                    'Ưu tiên các vị trí phù hợp với lô hàng có hạn sử dụng ngắn (để dễ xuất kho trước)'
                                }
                                placement="right"
                            >
                                <span className={cx('action-table-icon')} onClick={() => {}}>
                                    <Info size={18} />
                                </span>
                            </Tippy>
                        </label>
                        <select
                            id="expiredScore"
                            value={typeFilter.expiredScore}
                            onChange={(e) => {
                                setTypeFilter({ ...typeFilter, expiredScore: e.target.value });
                            }}
                        >
                            <option disabled></option>
                            {objectPriority.map((opt) => (
                                <option key={opt.name} value={opt.value}>
                                    {opt.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="unitScore">
                            <span>Ưu tiên theo đơn vị chứa</span>
                            <Tippy
                                content={'Ưu tiên các vị trí có kích thước phù hợp với đơn vị đóng gói.'}
                                placement="right"
                            >
                                <span className={cx('action-table-icon')} onClick={() => {}}>
                                    <Info size={18} />
                                </span>
                            </Tippy>
                        </label>
                        <select
                            id="unitScore"
                            value={typeFilter.unitScore}
                            onChange={(e) => {
                                setTypeFilter({ ...typeFilter, unitScore: e.target.value });
                            }}
                        >
                            <option disabled></option>
                            {objectPriority.map((opt) => (
                                <option key={opt.name} value={opt.value}>
                                    {opt.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="productSimilarityScore">
                            <span>Ưu tiên theo tương đồng sản phẩm</span>
                            <Tippy
                                content={
                                    'Ưu tiên đặt gần các sản phẩm cùng loại hoặc tương tự để tối ưu không gian và thao tác.'
                                }
                                placement="right"
                            >
                                <span className={cx('action-table-icon')} onClick={() => {}}>
                                    <Info size={18} />
                                </span>
                            </Tippy>
                        </label>
                        <select
                            id="productSimilarityScore"
                            value={typeFilter.productSimilarityScore}
                            onChange={(e) => {
                                setTypeFilter({ ...typeFilter, productSimilarityScore: e.target.value });
                            }}
                        >
                            <option disabled></option>
                            {objectPriority.map((opt) => (
                                <option key={opt.name} value={opt.value}>
                                    {opt.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="enoughAcreageScore">
                            <span>Ưu tiên theo đủ diện tích</span>
                            <Tippy
                                content={'Ưu tiên các vị trí còn đủ diện tích trống để chứa toàn bộ lô hàng.'}
                                placement="right"
                            >
                                <span className={cx('action-table-icon')} onClick={() => {}}>
                                    <Info size={18} />
                                </span>
                            </Tippy>
                        </label>
                        <select
                            id="enoughAcreageScore"
                            value={typeFilter.enoughAcreageScore}
                            onChange={(e) => {
                                setTypeFilter({ ...typeFilter, enoughAcreageScore: e.target.value });
                            }}
                        >
                            <option disabled></option>
                            {objectPriority.map((opt) => (
                                <option key={opt.name} value={opt.value}>
                                    {opt.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={cx('action-buttons')}>
                        <Button primary medium className={cx('btn-search')} onClick={handleReset}>
                            Đặt lại
                        </Button>
                        <Button success medium className={cx('btn-search')} onClick={handleSuggestLocation}>
                            Gợi ý vị trí
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ModalSuggestLocation;
