const DashboardCard = ({
    title,
    value,
    icon,
    color = "bg-blue-500"
}) => {

    return (

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-gray-500 text-sm font-medium">

                        {title}

                    </p>

                    <h2 className="text-3xl font-bold text-gray-800 mt-2">

                        {value}

                    </h2>

                </div>

                <div className={`${color} w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg`}>

                    {icon}

                </div>

            </div>

        </div>

    );

};

export default DashboardCard;