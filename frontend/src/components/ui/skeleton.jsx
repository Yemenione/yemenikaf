import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-coffee/10 ${className}`}
            {...props}
        />
    );
};

export default Skeleton;
