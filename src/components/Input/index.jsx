import classNames from 'classnames/bind';
import styles from './Input.module.scss';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
const limitCharacter = import.meta.env.VITE_LIMIT_CHARACTER;

const cx = classNames.bind(styles);

export default function Input({ borderRadius = 8, onSubmit, focusInput = false }) {
    const [value, setValue] = useState('');
    const [rowInput, setRowInput] = useState(1);
    const btnPostRef = useRef();
    const inputRef = useRef();

    const lineHeight = 17;
    const maxRows = 5;
    const minRows = 1;

    const handleOnchangeInput = (e) => {
        const valueChange = e.target.value;
        if (valueChange.length <= Number(limitCharacter)) {
            setValue(valueChange);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlePost();
        }
    };

    const handlePost = () => {
        // eslint-disable-next-line no-extra-boolean-cast
        if (!!value.trim()) {
            setValue('');
            onSubmit(value.trim());
        }
    };

    useEffect(() => {
        // eslint-disable-next-line no-extra-boolean-cast
        if (!!value.trim()) {
            btnPostRef.current.classList.add(cx('active'));
        } else {
            btnPostRef.current.classList.remove(cx('active'));
        }

        inputRef.current.style.height = 'auto';
        const scrollHeight = inputRef.current.scrollHeight;
        const maxHeight = lineHeight * maxRows;

        if (scrollHeight < maxHeight) {
            inputRef.current.style.height = scrollHeight + 'px';
            inputRef.current.style.overflowY = 'hidden';
        } else {
            inputRef.current.style.height = maxHeight + 'px';
            inputRef.current.style.overflowY = 'auto';
        }
        setRowInput(Math.ceil(scrollHeight / lineHeight));
    }, [value]);

    useEffect(() => {
        if (focusInput && inputRef.current) {
            inputRef.current.focus();
        }
    }, [focusInput]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('group-input')} style={{ borderRadius: `${borderRadius}px` }}>
                <div className={cx('input-area-group')}>
                    <textarea
                        ref={inputRef}
                        className={cx('input-area')}
                        placeholder="Add comment..."
                        value={value}
                        rows={minRows}
                        onChange={handleOnchangeInput}
                        onKeyDown={handleKeyDown}
                    ></textarea>
                    {rowInput > 1 && (
                        <span className={cx('limit-text')}>
                            {value.length}/{limitCharacter}
                        </span>
                    )}
                </div>
            </div>
            <button onClick={handlePost} className={cx('btn-post')}>
                <Send ref={btnPostRef} size={22} strokeWidth={2} absoluteStrokeWidth />
            </button>
        </div>
    );
}
