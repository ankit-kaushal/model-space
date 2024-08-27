const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      if (file instanceof Blob) {
        reader.readAsDataURL(file);
      } else {
        reject(new Error('File is not of type Blob.'));
      }
});

export default convertToBase64;