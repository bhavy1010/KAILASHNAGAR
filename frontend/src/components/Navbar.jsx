// ======================================================
// Imports
// ======================================================

import {

    Search,

    Bell,

    CalendarDays,

    ChevronDown

} from "lucide-react";

// ======================================================
// Component
// ======================================================

const Navbar = () => {

    const today = new Date().toLocaleDateString(

        "en-IN",

        {

            weekday: "long",

            day: "numeric",

            month: "long",

            year: "numeric"

        }

    );

    return (

        <header

            className="

                h-20

                bg-white

                border-b

                border-gray-100

                flex

                items-center

                justify-between

                px-8

            "

        >

            {/* =====================================
                Search
            ====================================== */}

            <div

                className="

                    w-[420px]

                    h-12

                    rounded-xl

                    bg-gray-100

                    flex

                    items-center

                    px-4

                    gap-3

                "

            >

                <Search

                    size={18}

                    className="text-gray-400"

                />

                <input

                    type="text"

                    placeholder="Search students, teachers..."

                    className="

                        flex-1

                        bg-transparent

                        text-sm

                        outline-none

                    "

                />

            </div>

            {/* =====================================
                Right Side
            ====================================== */}

            <div

                className="

                    flex

                    items-center

                    gap-6

                "

            >

                {/* Date */}

                <div

                    className="

                        flex

                        items-center

                        gap-2

                        text-gray-500

                        text-sm

                    "

                >

                    <CalendarDays size={18}/>

                    {today}

                </div>

                {/* Notification */}

                <button

                    className="

                        relative

                        w-11

                        h-11

                        rounded-xl

                        bg-gray-100

                        flex

                        items-center

                        justify-center

                        hover:bg-gray-200

                        transition

                    "

                >

                    <Bell size={20}/>

                    <span

                        className="

                            absolute

                            top-2

                            right-2

                            w-2

                            h-2

                            rounded-full

                            bg-red-500

                        "

                    />

                </button>

                {/* Profile */}

                <button

                    className="

                        flex

                        items-center

                        gap-3

                    "

                >

                    <img

                        src="https://i.pravatar.cc/150?img=12"

                        alt="Admin"

                        className="

                            w-11

                            h-11

                            rounded-full

                        "

                    />

                    <div

                        className="

                            text-left

                        "

                    >

                        <h3

                            className="

                                text-sm

                                font-semibold

                            "

                        >

                            Admin

                        </h3>

                        <p

                            className="

                                text-xs

                                text-gray-400

                            "

                        >

                            Principal

                        </p>

                    </div>

                    <ChevronDown

                        size={18}

                        className="text-gray-400"

                    />

                </button>

            </div>

        </header>

    );

};

export default Navbar;
