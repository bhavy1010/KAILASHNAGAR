import { Bell, Search, UserCircle2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {

    const location = useLocation();

    const { user } = useAuth();

    const getTitle = () => {

        switch (location.pathname) {

            case "/dashboard":
                return "Dashboard";

            case "/students":
                return "Students";

            case "/students/add":
                return "Add Student";

            case "/teachers":
                return "Teachers";

            case "/attendance":
                return "Attendance";

            case "/homework":
                return "Homework";

            case "/exams":
                return "Exams";

            case "/notices":
                return "Notices";

            case "/settings":
                return "Settings";

            default:
                return "School ERP";

        }

    };

    const today = new Date().toLocaleDateString("en-IN", {

        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"

    });

    return (

        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">

            <div>

                <h1 className="text-3xl font-bold text-gray-800">

                    {getTitle()}

                </h1>

                <p className="text-sm text-gray-500 mt-1">

                    {today}

                </p>

            </div>

            <div className="flex items-center gap-5">

                <div className="hidden md:flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-xl w-80">

                    <Search
                        size={18}
                        className="text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent flex-1 outline-none text-sm"
                    />

                </div>

                <button className="relative w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">

                    <Bell
                        size={20}
                    />

                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>

                </button>

                <div className="flex items-center gap-3">

                    <UserCircle2
                        size={42}
                        className="text-blue-600"
                    />

                    <div className="hidden sm:block">

                        <p className="font-semibold text-gray-800">

                            {user?.name || "Admin"}

                        </p>

                        <p className="text-sm text-gray-500 capitalize">

                            {user?.role || "Administrator"}

                        </p>

                    </div>

                </div>

            </div>

        </header>

    );

};

export default Navbar;