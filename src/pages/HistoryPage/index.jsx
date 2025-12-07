import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './HistoryPage.module.scss';
import { MyTable, Button, Modal } from '../../components';
import { ArrowRightLeft, FileMinus, MapPin, PlusCircle } from 'lucide-react';
import HistoryTransaction from './HistoryTransaction';
import HistoryLocation from './HistoryLocation';

const cx = classNames.bind(styles);

const HistoryPage = () => {
    const [tabActive, setTabActive] = useState(1);

    const handleActiveTab = (index) => setTabActive(index);

    return (
        <div className={cx('wrapper-receive-product')}>
            <section className={cx('header-tab')}>
                <Button
                    active={tabActive == 1 ? true : false}
                    onClick={() => handleActiveTab(1)}
                    leftIcon={<ArrowRightLeft size={20} />}
                >
                    <span>Lịch sử nhập xuất kho</span>
                </Button>
                <Button
                    active={tabActive == 2 ? true : false}
                    onClick={() => handleActiveTab(2)}
                    leftIcon={<MapPin size={20} />}
                >
                    <span>Lịch sử cập nhật vị trí</span>
                </Button>
            </section>

            {tabActive == 1 && <HistoryTransaction />}
            {tabActive == 2 && <HistoryLocation />}
        </div>
    );
};

export default HistoryPage;
