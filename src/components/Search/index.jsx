import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import Tippy from '@tippyjs/react/headless';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import styles from './Search.module.scss';
import { Popper as PoperWrapper } from '@/components';
import { useDebounce } from '@/hooks';
import { CircleX, Loader, Search as SearchIcon } from 'lucide-react';

const cx = classNames.bind(styles);

export default function Search() {
    const [searchValue, setSearchValue] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [showResult, setShowResult] = useState(true);
    const [showLoading, setShowLoading] = useState(false);

    const debounce = useDebounce(searchValue, 500);
    const searchElement = useRef();

    useEffect(() => {
        if (!debounce.trim()) {
            setSearchResult([]);
            return;
        }

        const handleLogic = async () => {
            console.log(1);
            setShowLoading(true);

            setTimeout(() => {
                console.log(2);

                setShowLoading(false);
            }, 1000);
        };

        handleLogic();
    }, [debounce]);

    const handleClear = () => {
        setSearchValue('');
        setSearchResult([]);
        searchElement.current.focus();
    };

    const handleChange = (e) => {
        const searchValue = e.target.value;
        if (!searchValue.startsWith(' ')) {
            setSearchValue(searchValue);
        }
    };

    const handleHideResult = () => setShowResult(false);

    return (
        <div>
            <Tippy
                // Có thể selec được items
                interactive
                // xét ẩn hiện của tippy
                visible={searchResult.length > 0 && showResult}
                // render ra component của phần tử hover
                render={(attrs) => (
                    <div className={cx('search-result')} tabIndex="-1" {...attrs}>
                        <PoperWrapper>
                            <h4 className={cx('search-title')}>Account</h4>
                            {searchResult.map((item) => (
                                <AccountItem data={item} key={item.id} />
                            ))}
                        </PoperWrapper>
                    </div>
                )}
                onClickOutside={handleHideResult}
            >
                <div className={cx('search')}>
                    <input
                        ref={searchElement}
                        placeholder="Tìm kiếm thông tin"
                        spellCheck={false}
                        value={searchValue}
                        onChange={handleChange}
                        onFocus={() => setShowResult(true)}
                    />
                    {!!searchValue && !showLoading && (
                        <button className={cx('close')} onClick={handleClear}>
                            <CircleX size={24} />
                        </button>
                    )}
                    {showLoading && <Loader className={cx('spiner')} size={24} />}
                    <button className={cx('search-btn')} onMouseDown={(e) => e.preventDefault()}>
                        <SearchIcon size={26} />
                    </button>
                </div>
            </Tippy>
        </div>
    );
}
