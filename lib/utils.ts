export const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64DataUrl = reader.result as string;
      resolve(base64DataUrl);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
