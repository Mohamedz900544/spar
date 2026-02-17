export const getTokenOrRedirect = (navigate, requiredRole = "admin") => {
    const token = localStorage.getItem("sparvi_token");
    const role = localStorage.getItem("sparvi_role");
    if (!token || role !== requiredRole) {
        navigate?.("/login");
        return null;
    }
    return token;
};

// format time
export const formatTime = (timeString) => {
    if (!timeString) return timeString
    const [hours, minutes] = timeString.split(':')
    const h = parseInt(hours);
    const suffix = h >= 12 ? "PM" : "AM";
    const adjustedHour = h % 12 || 12;
    return `${adjustedHour}:${minutes} ${suffix}`
}
