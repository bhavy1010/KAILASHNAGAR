// ======================================================
// Imports
// ======================================================

import {

    LayoutDashboard,

    Users,

    GraduationCap,

    ClipboardCheck,

    BookOpen,

    FileText,

    Bell,

    Settings,

    School,

    LogOut

} from "lucide-react";

import {

    NavLink,

    useNavigate

} from "react-router-dom";

// ======================================================
// Menu
// ======================================================

const menu = [

    {

        title:"Dashboard",

        path:"/dashboard",

        icon:<LayoutDashboard size={20}/>

    },

    {

        title:"Students",

        path:"/students",

        icon:<Users size={20}/>

    },

    {

        title:"Teachers",

        path:"/teachers",

        icon:<GraduationCap size={20}/>

    },

    {

        title:"Attendance",

        path:"/attendance",

        icon:<ClipboardCheck size={20}/>

    },

    {

        title:"Homework",

        path:"/homework",

        icon:<BookOpen size={20}/>

    },

    {

        title:"Exams",

        path:"/exams",

        icon:<FileText size={20}/>

    },

    {

        title:"Notices",

        path:"/notices",

        icon:<Bell size={20}/>

    },

    {

        title:"Settings",

        path:"/settings",

        icon:<Settings size={20}/>

    }

];

// ======================================================
// Component
// ======================================================

const Sidebar = () => {

    const navigate = useNavigate();

    const logout = () => {

        // Later we'll clear JWT here

        navigate("/login");

    };

    return (

        <aside

            className="

                w-[280px]

                min-h-screen

                bg-[#2B1CFF]

                text-white

                flex

                flex-col

                px-6

                py-8

            "

        >

            {/* Logo */}

            <div

                className="

                    flex

                    items-center

                    gap-4

                    mb-12

                "

            >

                <div

                    className="

                        w-14

                        h-14

                        rounded-2xl

                        bg-white

                        text-[#2B1CFF]

                        flex

                        items-center

                        justify-center

                    "

                >

                    <School size={28}/>

                </div>

                <div>

                    <h2

                        className="

                            text-xl

                            font-bold

                        "

                    >

                        KailashNagar

                    </h2>

                    <p

                        className="

                            text-sm

                            text-white/70

                        "

                    >

                        School ERP

                    </p>

                </div>

            </div>

            {/* Menu */}

            <nav

                className="

                    flex-1

                    space-y-2

                "

            >

                {

                    menu.map((item)=>(

                        <NavLink

                            key={item.title}

                            to={item.path}

                            className={({isActive})=>

                                `

                                flex

                                items-center

                                gap-4

                                px-5

                                py-4

                                rounded-2xl

                                transition-all

                                duration-200

                                ${

                                    isActive

                                    ?

                                    "bg-white text-[#2B1CFF] font-semibold shadow-lg"

                                    :

                                    "hover:bg-white/10"

                                }

                                `

                            }

                        >

                            {item.icon}

                            {item.title}

                        </NavLink>

                    ))

                }

            </nav>

            {/* Logout */}

            <button

                onClick={logout}

                className="

                    mt-8

                    flex

                    items-center

                    gap-4

                    rounded-2xl

                    bg-red-500/20

                    px-5

                    py-4

                    text-white

                    transition-all

                    hover:bg-red-500

                "

            >

                <LogOut size={20}/>

                Logout

            </button>

        </aside>

    );

};

export default Sidebar;