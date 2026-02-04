import React from 'react';
import Skeleton from './Skeleton';

const ProductCardSkeleton = () => {
    return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
