import React from 'react';
import Tippy from '@tippyjs/react/headless';

const WrapperTippy = ({ 
    interactive=true,
    children, 
    renderTooltip,
    delay=[0,200],
    offset=[-5,15],
    placement="bottom-end",
    ...pass
 }
) => {
    return (
        <Tippy 
            interactive={interactive}
            render={renderTooltip}
            delay={delay}
            offset={offset}
            placement={placement}
            {...pass}
        >
            {children}
        </Tippy>
    );
};

export default WrapperTippy;
