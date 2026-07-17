const DashboardCard = ({
    title,
    value,
    icon,
    color = "bg-blue-500"
}) => {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-gray-800">
                        {value}
                    </h2>
                </div>

                <div
                    className={`${color} flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg sm:h-14 sm:w-14`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;