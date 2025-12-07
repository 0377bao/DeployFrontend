import { Tooltip } from 'antd';

const TooltipTable = ({ textColor = '#333', backgroundColor = '#fff', text, textHover }) => {
    return (
        <Tooltip
            color={backgroundColor} // đổi nền + mũi tên
            styles={{
                body: { color: textColor }, // đổi màu chữ
                root: { ['--antd-arrow-background-color']: backgroundColor }, // (optional) đảm bảo màu mũi tên đồng bộ
            }}
            title={textHover}
        >
            <span>{text}</span>
        </Tooltip>
    );
};

export default TooltipTable;
