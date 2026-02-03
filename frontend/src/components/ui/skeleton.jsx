import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-muted ${className}`}
            {...props}
        />
    );
};

export const ProductCardSkeleton = () => {
    return (
        <div className="w-full h-full">
            <Skeleton className="aspect-[3/4] w-full mb-4" />
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-6 w-2/3 mb-4" />
            <div className="flex justify-between">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-10 w-1/3 rounded-sm" />
            </div>
        </div>
    );
};

export default Skeleton;
