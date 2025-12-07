export default function parseToken(key) {
    const token = JSON.parse(localStorage.getItem(key))
    if(token) {
        return {...token}
    }
    return null
}