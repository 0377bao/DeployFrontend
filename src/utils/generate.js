import md5 from "md5"

export const generateCode = (prefix) =>{
    const randomChar = md5(Date.now().toString()).slice(-5)
    return `${prefix}${randomChar}`
}