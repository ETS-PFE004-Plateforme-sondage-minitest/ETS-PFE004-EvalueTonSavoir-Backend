
roomPassword = "1234";

changePassword = (newPassword) => {
    roomPassword = newPassword;
}
getPassword = () => {
    return roomPassword;
}


module.exports = {
    changePassword,
    getPassword
}