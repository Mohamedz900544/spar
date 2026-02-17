import { useRef } from "react";
import { FaXmark } from "react-icons/fa6";

const UpdateSessionForm = ({ openForm, setOpenForm, session, setSession, handleUpdateSession }) => {

    const formRef = useRef()
    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        // Create date object, convert to ISO string (YYYY-MM-DDTHH:mm:ss.sssZ), take first part
        try {
            return new Date(dateString).toISOString().split('T')[0];
        } catch {
            return "";
        }
    };
    return <div className={`fixed left-0 z-10 top-0 w-full justify-center items-center h-screen bg-[#0000005c] ${openForm ? 'flex' : 'hidden'}`}>
        <form ref={formRef} onSubmit={(e) => handleUpdateSession(e, session)} className="text-black  bg-white w-[500px] rounded-xl p-5 pb-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#0b63c7]">
                    Update Session
                </h2>
                <FaXmark
                    style={{
                        color: "#ff0000",
                        fontSize: '25px',
                        cursor: "pointer",
                        width: "30px",
                        height: '30px',
                        display: "flex",
                        justifyContent: "center",
                        borderRadius: '10px',
                        backgroundColor: "#ff00006b"
                    }}
                    onClick={() => setOpenForm(false)} />
            </div>
            <div className="flex flex-col gap-2 mt-4">
                <label htmlFor="title">Title</label>
                <input type="text" name="title" id="title" value={session.title} onChange={(e) => setSession({ ...session, title: e.target.value })}
                    placeholder="Session 1 - Linear"
                    className="bg-white rounded-lg border-2 px-2 py-1" />
            </div>

            <div className="flex flex-col gap-2 mt-4">
                <label htmlFor="description">Description</label>
                <textarea name="description" placeholder="Description" id="description" value={session.description} onChange={(e) => setSession({ ...session, description: e.target.value })}
                    className="bg-white rounded-lg border-2 px-2 py-1" />
            </div>

            <div className="flex flex-col gap-2 mt-4">
                <label htmlFor="campus">Campus</label>
                <input type="text" name="campus" id="campus" value={session.campus} onChange={(e) => setSession({ ...session, campus: e.target.value })}
                    placeholder="North Campus"
                    className="bg-white rounded-lg border-2 px-2 py-1" />
            </div>
            <div className="flex flex-col gap-2 mt-4">
                <label htmlFor="capacity">capacity</label>
                <input type="number" name="capacity" id="capacity" value={session.capacity} onChange={(e) => setSession({ ...session, capacity: e.target.value })}
                    placeholder="12"
                    className="bg-white rounded-lg border-2 px-2 py-1" />
            </div>
            <div className="flex flex-col gap-2 mt-4">
                <label htmlFor="time">time</label>
                <input type="time" name="time" id="time" value={session.time} onChange={(e) => setSession({ ...session, time: e.target.value })}
                    className="bg-white rounded-lg border-2 px-2 py-1" />
            </div>
            <div className="flex flex-col gap-2 mt-4">
                <label htmlFor="date">Date</label>
                <input type="date" name="date" id="date" value={formatDateForInput(new Date(session?.date))} onChange={(e) => setSession({ ...session, date: e.target.value })}
                    className="bg-white rounded-lg border-2 px-2 py-1" />
            </div>

            <button className="bg-[#0b63c7] rounded-full w-full text-white p-2 mt-4 hover:bg-[#0b63c9] active:scale-[90%] duration-300 transition">Update Session</button>
            {/*
enrolled */}
        </form>
    </div>
}

export default UpdateSessionForm
