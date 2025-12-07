import React, { forwardRef, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Button from '../Button';

const Printer = ({ children, buttonLabel = 'Print', Icon, propsButton }) => {
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Print',
        onAfterPrint: () => console.log('Printing done!'),
    });

    return (
        <>
            <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute' }}>
                <div ref={componentRef}>{children}</div>
            </div>

            <Button onClick={handlePrint} leftIcon={Icon} {...propsButton}>
                {buttonLabel}
            </Button>
        </>
    );
};

export default Printer;
