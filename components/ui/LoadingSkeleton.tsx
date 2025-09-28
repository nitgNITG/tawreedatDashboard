const LoadingSkeleton = () => {
    return (
        <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
            
            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-6 rounded-lg shadow-md bg-white border-l-4 border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="space-y-3">
                                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                            </div>
                            <div className="p-3 rounded-full bg-gray-200">
                                <div className="w-6 h-6"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    )
}

export default LoadingSkeleton 