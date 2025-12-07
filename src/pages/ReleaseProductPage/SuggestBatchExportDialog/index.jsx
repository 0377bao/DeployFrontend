import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './SuggestBatchExportDialog.module.scss';
import { Modal, Button, Select } from '@/components';
import { Info } from 'lucide-react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const cx = classNames.bind(styles);

const options = [
    { name: 'Không ưu tiên', value: 0 },
    { name: 'Ưu tiên 1', value: 100 },
    { name: 'Ưu tiên 2', value: 50 },
    { name: 'Ưu tiên 3', value: 20 },
];

const priorities = [
    {
        label: 'Ưu tiên theo hạn sử dụng',
        info: 'Ưu tiên xuất hàng theo hạn sử dụng của lô hàng',
    },
    // {
    //     label: 'Ưu tiên theo vị trí thuận tiện xuất',
    //     info: 'Ưu tiên những lô hàng đáp ứng số lương và thuận tiện trong việc lấy hàng nhất',
    // },
    {
        label: 'Ưu tiên theo nhập trước xuất trước',
        info: 'Ưu tiên lô hàng nào nhập vào trước thì xuất trước',
    },
];

const SuggestBatchExportDialog = ({ isOpen, onClose, onSuggest, onReset }) => {
    const [priorityValues, setPriorityValues] = useState([
        { key: 'expirePriority', value: null },
        // { key: 'positionPriority', value: null },
        { key: 'rankPriority', value: null }, // thứ tự vào trước ra trước
    ]);

    const handleChange = (idx, value) => {
        const newValues = [...priorityValues];
        newValues[idx] = { ...newValues[idx], value };
        setPriorityValues(newValues);
    };

    const handleResetSuggest = () => {
        setPriorityValues([
            { key: 'expirePriority', value: null },
            //{ key: 'positionPriority', value: null },
            { key: 'rankPriority', value: null }, // thứ tự vào trước ra trước
        ]);
        onReset(); // fetch data again
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('wrapper-suggest-batch')}>
                {priorities.map((item, idx) => (
                    <div key={idx} className={cx('priority-row')}>
                        <div className={cx('priority-label')}>
                            <span>{item.label}</span>
                            <Tippy content={item.info} placement="right">
                                <span className={cx('icon-info')}>
                                    <Info size={18} />
                                </span>
                            </Tippy>
                        </div>
                        <Select
                            classNames={cx('priority-select')}
                            options={options}
                            value={priorityValues[idx].value ?? ''}
                            onChange={(e) => handleChange(idx, e.target.value)}
                        />
                    </div>
                ))}
                <div className={cx('action-row')}>
                    <Button primary onClick={handleResetSuggest}>
                        Đặt lại
                    </Button>
                    <Button
                        success
                        onClick={() =>
                            onSuggest({
                                expirePriority: Number.parseInt(priorityValues[0].value || 0),
                                // positionPriority: Number.parseInt(priorityValues[1].value || 0),
                                rankPriority: Number.parseInt(priorityValues[1].value || 0),
                            })
                        }
                    >
                        Gợi ý vị trí
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SuggestBatchExportDialog;
