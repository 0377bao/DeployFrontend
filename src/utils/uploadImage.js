import request from "./httpRequest"

function base64ToFile(base64String) {
  // Tách bỏ prefix data:image/png;base64,...
  const arr = base64String.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], `image${Math.random().toFixed(2)}${mime}`, { type: mime });
}

export const uploadImage = async (fileBase64) => {
    try{
        const file = base64ToFile(fileBase64)
        const formData = new FormData()
        formData.append('image', file)
        const response = await request.post('/api/image/upload', formData)
        return response.data.imageUrl
    }catch(err) {
        console.log(err)
        throw new Error(err.response.data.message)
    }
}
